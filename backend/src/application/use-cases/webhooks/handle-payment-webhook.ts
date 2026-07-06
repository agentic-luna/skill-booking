import { BookingStatus, LedgerTxnType, LedgerStatus, CommissionType, TriggerEvent, DeliveryChannel, NotificationStatus } from '@prisma/client';
import { IBookingRepository } from '../../../domain/repositories/booking.repository';
import { ILedgerRepository } from '../../../domain/repositories/ledger.repository';
import { IConfigRepository } from '../../../domain/repositories/config.repository';
import { INotificationRepository } from '../../../domain/repositories/notification.repository';
import { IQueueService } from '../../services/queue.service';
import { IRequest, IRequestHandler } from '../../common/mediator';

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
    private queueService: IQueueService
  ) {}

  async handle(command: HandlePaymentWebhookCommand): Promise<any> {
    const { payload } = command;
    const { event: eventType, payload: eventPayload } = payload;

    if (eventType !== 'payment.captured') {
      return { status: 'ignored', message: `Unhandled event trigger: ${eventType}` };
    }

    const payment = eventPayload.payment.entity;

    const bookingRef = payment.notes?.bookingRef || payment.description || payment.order_id;
    if (!bookingRef) {
      throw new Error('Could not extract booking reference from transaction metadata.');
    }

    const gatewayTxnId = payment.id || `pay_${Math.random().toString(36).substring(2, 9)}`;

    const booking = await this.bookingRepo.findFirstByRef(bookingRef);
    if (!booking) {
      throw new Error(`Booking record not found for ref: ${bookingRef}`);
    }

    if (booking.status === BookingStatus.CONFIRMED) {
      return { status: 'processed', bookingId: booking.id, gatewayTxnId };
    }

    // 1. Confirm booking
    await this.bookingRepo.update(booking.id, { status: BookingStatus.CONFIRMED });

    // 2. Platform revenue vs host liability
    const totalAmount = Number(booking.totalAmount);
    let platformRevenue = 0;

    const commission = booking.event.commission;
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

    // 3. Write Payment capture to Ledger
    await this.ledgerRepo.create({
      bookingId: booking.id,
      gatewayTxnId,
      type: LedgerTxnType.PAYMENT_CAPTURE,
      amountCaptured: totalAmount,
      platformRevenue,
      hostLiability,
      status: LedgerStatus.HELD,
    });

    // 4. Resolve notification templates and enqueue background job dispatch
    const client = booking.client;
    const event = booking.event;

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

    return {
      status: 'processed',
      bookingId: booking.id,
      gatewayTxnId,
    };
  }
}
