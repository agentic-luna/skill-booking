import { UserRole, BookingStatus, LedgerTxnType, LedgerStatus, CommissionType } from '@prisma/client';
import { IBookingRepository } from '../../../domain/repositories/booking.repository';
import { IEventRepository } from '../../../domain/repositories/event.repository';
import { IConfigRepository } from '../../../domain/repositories/config.repository';
import { ILedgerRepository } from '../../../domain/repositories/ledger.repository';
import { IPaymentGatewayProvider } from '../../../infrastructure/services/providers/payment-gateway.provider';
import { NotFoundError, ForbiddenError, BadRequestError } from '../../common/errors';
import { IRequest, IRequestHandler } from '../../common/mediator';

export class CancelBookingCommand implements IRequest<any> {
  readonly __tag = 'CancelBookingCommand';
  constructor(
    public readonly bookingId: string,
    public readonly userId: string,
    public readonly role: string
  ) {}
}

export class CancelBookingCommandHandler implements IRequestHandler<CancelBookingCommand, any> {
  constructor(
    private bookingRepo: IBookingRepository,
    private eventRepo: IEventRepository,
    private configRepo: IConfigRepository,
    private ledgerRepo: ILedgerRepository,
    private paymentGateway: IPaymentGatewayProvider
  ) {}

  async handle(command: CancelBookingCommand): Promise<any> {
    const { bookingId, userId, role } = command;

    const booking = await this.bookingRepo.findById(bookingId);
    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    if (role === UserRole.CLIENT && booking.clientId !== userId) {
      throw new ForbiddenError('Forbidden. You do not own this booking.');
    }

    if (booking.status === BookingStatus.CANCELED || booking.status === BookingStatus.REFUNDED) {
      throw new BadRequestError('Booking is already canceled or refunded.');
    }

    const event = booking.event;
    const totalAmount = Number(booking.totalAmount);

    // Fetch refund matrix setting
    const setting = await this.configRepo.findPlatformSetting('refund_matrix');

    let refundPercentage = 100;
    const now = new Date();
    const eventStartTime = new Date(event.startTime);
    const hoursDiff = (eventStartTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursDiff <= 0) {
      refundPercentage = 0; // Event started
    } else if (setting && setting.value) {
      const matrix = setting.value as Array<{ hoursBefore: number; refundPercentage: number }>;
      if (Array.isArray(matrix)) {
        const sorted = [...matrix].sort((a, b) => b.hoursBefore - a.hoursBefore);
        const matched = sorted.find((r) => hoursDiff >= r.hoursBefore);
        refundPercentage = matched ? matched.refundPercentage : 0;
      }
    }

    const refundAmount = totalAmount * (refundPercentage / 100);

    // Replenish seats
    await this.eventRepo.incrementSeats(event.id, booking.seatCount);

    const updatedStatus = refundAmount > 0 ? BookingStatus.REFUNDED : BookingStatus.CANCELED;
    const updatedBooking = await this.bookingRepo.update(bookingId, { status: updatedStatus });

    // Handle ledger refund logs and trigger payment gateway refund
    const ledgers = await this.ledgerRepo.findMany({
      bookingId,
      type: LedgerTxnType.PAYMENT_CAPTURE,
    });

    const paymentLedger = ledgers.find((l) => l.status === LedgerStatus.HELD);

    if (paymentLedger && refundAmount > 0) {
      // Trigger payment gateway refund
      const refundResult = await this.paymentGateway.initiateRefund(
        paymentLedger.gatewayTxnId,
        refundAmount,
        { bookingId, bookingRef: booking.bookingRef }
      );

      const commissionPct =
        event.commission?.commissionType === CommissionType.PERCENTAGE
          ? Number(event.commission.platformValue) / 100
          : 0.1; // Default 10%

      const lostHostLiability = refundAmount * (1 - commissionPct);
      const lostPlatformRevenue = refundAmount * commissionPct;

      // Register REFUND ledger log
      await this.ledgerRepo.create({
        bookingId,
        gatewayTxnId: refundResult.refundId,
        type: LedgerTxnType.REFUND,
        amountCaptured: -refundAmount,
        platformRevenue: -lostPlatformRevenue,
        hostLiability: -lostHostLiability,
        status: LedgerStatus.REFUNDED_TO_CLIENT,
      });

      // Update payment ledger status
      await this.ledgerRepo.update(paymentLedger.id, {
        status: LedgerStatus.REFUNDED_TO_CLIENT,
      });
    }

    return {
      booking: updatedBooking,
      refundAmount,
      refundPercentage,
    };
  }
}
