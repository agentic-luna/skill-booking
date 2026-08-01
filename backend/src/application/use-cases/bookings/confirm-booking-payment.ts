import { BookingStatus, LedgerTxnType, LedgerStatus, CommissionType, TriggerEvent, DeliveryChannel, NotificationStatus, IntegrationService } from '@prisma/client';
import { IBookingRepository } from '../../../domain/repositories/booking.repository';
import { ILedgerRepository } from '../../../domain/repositories/ledger.repository';
import { IConfigRepository } from '../../../domain/repositories/config.repository';
import { prisma } from '../../../config/prisma';
import { INotificationRepository } from '../../../domain/repositories/notification.repository';
import { IQueueService } from '../../services/queue.service';
import { IRequest, IRequestHandler } from '../../common/mediator';
import { NotFoundError, BadRequestError } from '../../common/errors';
import { parseCommissionRate } from '../../../utils/commission-parser';
import { ICacheService } from '../../services/cache.service';
import { ICryptoService } from '../../services/crypto.service';
import crypto from 'crypto';

export class ConfirmBookingPaymentCommand implements IRequest<any> {
  readonly __tag = 'ConfirmBookingPaymentCommand';
  constructor(
    public readonly bookingId: string,
    public readonly clientId: string,
    public readonly paymentMethod?: string,
    public readonly razorpayPaymentId?: string,
    public readonly razorpayOrderId?: string,
    public readonly razorpaySignature?: string
  ) { }
}

export class ConfirmBookingPaymentCommandHandler implements IRequestHandler<ConfirmBookingPaymentCommand, any> {
  constructor(
    private bookingRepo: IBookingRepository,
    private ledgerRepo: ILedgerRepository,
    private configRepo: IConfigRepository,
    private cryptoService: ICryptoService,
    private notificationRepo: INotificationRepository,
    private queueService: IQueueService,
    private cacheService: ICacheService
  ) { }

  async handle(command: ConfirmBookingPaymentCommand): Promise<any> {
    const { bookingId, clientId, paymentMethod, razorpayOrderId, razorpayPaymentId } = command;

    let booking = await this.bookingRepo.findById(bookingId);
    if (!booking && razorpayOrderId) {
      booking = await this.bookingRepo.findByRazorpayOrderId(razorpayOrderId);
    }

    if (!booking) {
      throw new NotFoundError('Booking record not found.');
    }

    if (booking.clientId !== clientId) {
      throw new BadRequestError('You are not authorized to confirm this booking.');
    }

    if (booking.status === BookingStatus.CONFIRMED) {
      return { success: true, message: 'Booking is already confirmed', booking };
    }

    if (booking.status === BookingStatus.CANCELED || booking.status === BookingStatus.REFUNDED) {
      throw new BadRequestError(`Cannot confirm payment for a booking with status '${booking.status}'.`);
    }

    let gatewayTxnId = `direct_pay_${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    if (command.razorpaySignature) {
      const config = await this.configRepo.findIntegration(IntegrationService.RAZORPAY);
      if (!config || !config.credentials || typeof config.credentials !== 'object') {
        throw new BadRequestError('Payment gateway is not configured. Admin has to configure Razorpay credentials.');
      }

      const decrypted = this.cryptoService.decryptCredentials(config.credentials);
      const keySecret = decrypted?.keySecret;
      if (!keySecret) {
        throw new BadRequestError('Payment gateway is not configured. Admin has to configure Razorpay credentials.');
      }

      // Verify signature
      const hmac = crypto.createHmac('sha256', keySecret);
      hmac.update(`${command.razorpayOrderId}|${command.razorpayPaymentId}`);
      const generatedSignature = hmac.digest('hex');

      if (generatedSignature !== command.razorpaySignature) {
        throw new BadRequestError('Invalid payment signature');
      }
      gatewayTxnId = command.razorpayPaymentId || gatewayTxnId;
    }

    // 1. Mark payment captured & confirm booking
    const updatedBooking = await this.bookingRepo.markPaymentCaptured(booking.id, {
      razorpayPaymentId: razorpayPaymentId || gatewayTxnId,
      paymentMethod: paymentMethod || 'RAZORPAY',
      paymentCapturedAt: new Date(),
      paymentGateway: 'RAZORPAY',
    });

    // Increment conversions for boosted events
    try {
      const boost = await prisma.boostedEvent.findFirst({
        where: { eventId: booking.eventId, isActive: true, status: 'ACTIVE' }
      });
      if (boost) {
        await prisma.boostedEvent.update({
          where: { id: boost.id },
          data: { conversions: { increment: 1 } }
        });
      }
    } catch (err) {
      console.error("[Telemetry] Failed to increment boosted conversion", err);
    }

    // 2. Compute platform revenue vs host liability
    const totalAmount = Number(booking.totalAmount);
    let platformRevenue = 0;
    // Use snapshotted commission on booking if available, otherwise fall back to event commission
    const commType = booking.commissionType !== undefined ? booking.commissionType : booking.event?.commission?.commissionType;
    const commValue = booking.platformValue !== undefined ? booking.platformValue : booking.event?.commission?.platformValue;

    if (commType && commValue !== null && commValue !== undefined) {
      if (commType === CommissionType.PERCENTAGE) {
        platformRevenue = totalAmount * (Number(commValue) / 100);
      } else {
        platformRevenue = Number(commValue);
      }
    } else {
      let fallbackType: CommissionType = CommissionType.PERCENTAGE;
      let fallbackValue = 15;
      try {
        const setting = await this.configRepo.findPlatformSetting('commissionRate');
        const parsed = parseCommissionRate(setting?.value);
        fallbackType = parsed.commissionType;
        fallbackValue = parsed.platformValue;
      } catch (err) {
        // use default PERCENTAGE 15
      }

      if (fallbackType === CommissionType.PERCENTAGE) {
        platformRevenue = totalAmount * (fallbackValue / 100);
      } else {
        platformRevenue = fallbackValue;
      }
    }

    const hostLiability = totalAmount - platformRevenue;

    // 3. Write Payment capture entry to Transaction Ledger idempotently
    let ledgerEntry = null;
    const existingLedger = await this.ledgerRepo.findMany({ gatewayTxnId });
    if (!existingLedger || existingLedger.length === 0) {
      ledgerEntry = await this.ledgerRepo.create({
        bookingId: booking.id,
        gatewayTxnId,
        type: LedgerTxnType.PAYMENT_CAPTURE,
        amountCaptured: totalAmount,
        platformRevenue,
        hostLiability,
        status: LedgerStatus.HELD,
      });
    } else {
      ledgerEntry = existingLedger[0];
    }

    // 4. Resolve notification templates and enqueue background dispatch
    try {
      const fullBooking = await this.bookingRepo.findFirstByRef(booking.bookingRef);
      if (fullBooking) {
        const client = fullBooking.client;
        const event = fullBooking.event;

        const templates = await this.configRepo.findTemplates({
          triggerEvent: TriggerEvent.BOOKING_CONFIRMED,
          isActive: true,
        });

        for (const temp of templates) {
          let content = temp.bodyContent;
          const userName = `${client.firstName} ${client.lastName}`;
          const replacements = {
            '{{userName}}': userName,
            '{{eventTitle}}': event.title,
            '{{bookingRef}}': booking.bookingRef,
            '{{seatCount}}': booking.seatCount.toString(),
            '{{totalAmount}}': booking.totalAmount.toString(),
          };

          for (const [placeholder, value] of Object.entries(replacements)) {
            content = content.replace(new RegExp(placeholder, 'g'), value);
          }

          const recipient = temp.channel === DeliveryChannel.EMAIL ? client.email : client.phone;

          const log = await this.notificationRepo.create({
            userId: client.id,
            channel: temp.channel,
            triggerEvent: TriggerEvent.BOOKING_CONFIRMED,
            recipient,
            content,
            status: temp.channel === DeliveryChannel.IN_APP ? NotificationStatus.SENT : NotificationStatus.PENDING,
            sentAt: temp.channel === DeliveryChannel.IN_APP ? new Date() : null,
          });

          if (temp.channel !== DeliveryChannel.IN_APP) {
            await this.queueService.addNotificationJob(log.id);
          }
        }
      }
    } catch {
      // Notification enqueue logging failure silently avoided
    }

    // Clear the search cache when a booking changes seats or status
    await this.cacheService.delPattern('events:search:*');

    return {
      success: true,
      message: 'Booking payment confirmed directly',
      booking: updatedBooking,
      gatewayTxnId,
      paymentMethod: paymentMethod || 'DIRECT_PAYMENT',
      ledgerEntry,
    };
  }
}
