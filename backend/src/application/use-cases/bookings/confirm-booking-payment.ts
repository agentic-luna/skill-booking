import { BookingStatus, LedgerTxnType, LedgerStatus, CommissionType, TriggerEvent, DeliveryChannel, NotificationStatus } from '@prisma/client';
import { IBookingRepository } from '../../../domain/repositories/booking.repository';
import { ILedgerRepository } from '../../../domain/repositories/ledger.repository';
import { IConfigRepository } from '../../../domain/repositories/config.repository';
import { INotificationRepository } from '../../../domain/repositories/notification.repository';
import { IQueueService } from '../../services/queue.service';
import { IRequest, IRequestHandler } from '../../common/mediator';
import { NotFoundError, BadRequestError } from '../../common/errors';

export class ConfirmBookingPaymentCommand implements IRequest<any> {
  readonly __tag = 'ConfirmBookingPaymentCommand';
  constructor(
    public readonly bookingId: string,
    public readonly clientId: string,
    public readonly paymentMethod?: string
  ) {}
}

export class ConfirmBookingPaymentCommandHandler implements IRequestHandler<ConfirmBookingPaymentCommand, any> {
  constructor(
    private bookingRepo: IBookingRepository,
    private ledgerRepo: ILedgerRepository,
    private configRepo: IConfigRepository,
    private notificationRepo: INotificationRepository,
    private queueService: IQueueService
  ) {}

  async handle(command: ConfirmBookingPaymentCommand): Promise<any> {
    const { bookingId, clientId, paymentMethod } = command;

    const booking = await this.bookingRepo.findById(bookingId);
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

    const gatewayTxnId = `direct_pay_${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    // 1. Update Booking status to CONFIRMED
    const updatedBooking = await this.bookingRepo.update(booking.id, {
      status: BookingStatus.CONFIRMED,
    });

    // 2. Compute platform revenue vs host liability
    const totalAmount = Number(booking.totalAmount);
    let platformRevenue = 0;

    const commission = booking.event?.commission;
    if (commission) {
      if (commission.commissionType === CommissionType.PERCENTAGE) {
        platformRevenue = totalAmount * (Number(commission.platformValue) / 100);
      } else {
        platformRevenue = Number(commission.platformValue);
      }
    } else {
      platformRevenue = totalAmount * 0.1;
    }

    const hostLiability = totalAmount - platformRevenue;

    // 3. Write Payment capture entry to Transaction Ledger
    const ledgerEntry = await this.ledgerRepo.create({
      bookingId: booking.id,
      gatewayTxnId,
      type: LedgerTxnType.PAYMENT_CAPTURE,
      amountCaptured: totalAmount,
      platformRevenue,
      hostLiability,
      status: LedgerStatus.HELD,
    });

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
