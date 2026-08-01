import { BookingStatus, LedgerTxnType, LedgerStatus, CommissionType, TriggerEvent, DeliveryChannel, NotificationStatus } from '@prisma/client';
import { IBookingRepository } from '../../../domain/repositories/booking.repository';
import { IBoostedEventRepository } from '../../../domain/repositories/boosted-event.repository';
import { ILedgerRepository } from '../../../domain/repositories/ledger.repository';
import { IConfigRepository } from '../../../domain/repositories/config.repository';
import { prisma } from '../../../config/prisma';
import { INotificationRepository } from '../../../domain/repositories/notification.repository';
import { IQueueService } from '../../services/queue.service';
import { IRequest, IRequestHandler } from '../../common/mediator';
import { parseCommissionRate } from '../../../utils/commission-parser';
import { ICacheService } from '../../services/cache.service';

export class HandlePaymentWebhookCommand implements IRequest<any> {
  readonly __tag = 'HandlePaymentWebhookCommand';
  constructor(public readonly payload: any) {}
}

export class HandlePaymentWebhookCommandHandler implements IRequestHandler<HandlePaymentWebhookCommand, any> {
  constructor(
    private bookingRepo: IBookingRepository,
    private ledgerRepo: ILedgerRepository,
    private configRepo: IConfigRepository,
    private notificationRepo: INotificationRepository,
    private queueService: IQueueService,
    private cacheService: ICacheService,
    private boostedRepo?: IBoostedEventRepository
  ) {}

  async handle(command: HandlePaymentWebhookCommand): Promise<any> {
    const { payload } = command;

    // Extract Razorpay payment details from payload
    const razorpayOrderId =
      payload.payload?.payment?.entity?.order_id ||
      payload.payload?.order?.entity?.id ||
      payload.razorpay_order_id ||
      payload.razorpayOrderId ||
      payload.order_id;

    const razorpayPaymentId =
      payload.payload?.payment?.entity?.id ||
      payload.razorpay_payment_id ||
      payload.razorpayPaymentId ||
      payload.paymentId;

    const paymentMethod =
      payload.payload?.payment?.entity?.method ||
      payload.paymentMethod ||
      'RAZORPAY';

    const capturedAtRaw = payload.payload?.payment?.entity?.created_at;
    const paymentCapturedAt = capturedAtRaw ? new Date(capturedAtRaw * 1000) : new Date();

    const bookingRef =
      payload.payload?.payment?.entity?.notes?.bookingRef ||
      payload.bookingRef;

    // Find booking primarily using razorpayOrderId
    let booking = null;
    if (razorpayOrderId) {
      booking = await this.bookingRepo.findByRazorpayOrderId(razorpayOrderId);
    }

    // Fall back to searching by bookingRef if not found by orderId
    if (!booking && bookingRef) {
      booking = await this.bookingRepo.findFirstByRef(bookingRef);
    }

    // If not a booking payment, check if it belongs to a BoostedEvent request
    if (!booking && razorpayOrderId && this.boostedRepo) {
      const boost = await this.boostedRepo.findByRazorpayOrderId(razorpayOrderId);
      if (boost) {
        if (boost.status === 'ACTIVE' || boost.status === 'APPROVED' || boost.webhookProcessed) {
          return {
            status: 'already_processed',
            type: 'boost',
            boostId: boost.id,
            gatewayTxnId: razorpayPaymentId || boost.razorpayPaymentId,
          };
        }

        const now = new Date();
        const startDate = new Date(boost.startDate);
        const initialStatus = now < startDate ? 'APPROVED' : 'ACTIVE';
        const isActive = now < startDate ? false : true;

        const updatedBoost = await this.boostedRepo.markPaymentCaptured(boost.id, {
          razorpayPaymentId: razorpayPaymentId || `pay_wh_${boost.id}`,
          paymentMethod,
          paymentCapturedAt,
          paymentGateway: 'RAZORPAY',
          status: initialStatus,
          isActive,
        });

        await this.cacheService.delPattern('events:search:*');

        return {
          status: 'processed',
          type: 'boost',
          boostId: updatedBoost.id,
          gatewayTxnId: razorpayPaymentId,
        };
      }
    }

    if (!booking) {
      throw new Error(`Booking/Boost not found for orderId: ${razorpayOrderId || 'N/A'} / ref: ${bookingRef || 'N/A'}`);
    }

    // Idempotency check: avoid double processing if already confirmed or webhook processed
    if (booking.status === BookingStatus.CONFIRMED || booking.webhookProcessed) {
      return {
        status: 'already_processed',
        bookingId: booking.id,
        gatewayTxnId: razorpayPaymentId || booking.razorpayPaymentId,
      };
    }

    const gatewayTxnId = razorpayPaymentId || booking.razorpayPaymentId || `pay_wh_${booking.id}`;

    // 1. Mark payment as captured & confirm booking
    const updatedBooking = await this.bookingRepo.markPaymentCaptured(booking.id, {
      razorpayPaymentId: gatewayTxnId,
      paymentMethod,
      paymentCapturedAt,
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
      console.error("[Telemetry] Failed to increment boosted conversion in webhook", err);
    }

    // 2. Platform revenue vs host liability
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

    // 3. Write Payment capture to Ledger idempotently
    const existingLedger = await this.ledgerRepo.findMany({ gatewayTxnId });
    if (!existingLedger || existingLedger.length === 0) {
      await this.ledgerRepo.create({
        bookingId: booking.id,
        gatewayTxnId,
        type: LedgerTxnType.PAYMENT_CAPTURE,
        amountCaptured: totalAmount,
        platformRevenue,
        hostLiability,
        status: LedgerStatus.HELD,
      });
    }

    // 4. Resolve notification templates and enqueue background job dispatch
    const client = booking.client;
    const event = booking.event;

    if (client && event) {
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

    // Clear search cache when seats count or booking status changes
    await this.cacheService.delPattern('events:search:*');

    return {
      status: 'processed',
      bookingId: booking.id,
      gatewayTxnId,
    };
  }
}
