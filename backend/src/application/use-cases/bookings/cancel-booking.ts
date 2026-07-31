import { UserRole, BookingStatus, LedgerTxnType, LedgerStatus, CommissionType } from '@prisma/client';
import { IBookingRepository } from '../../../domain/repositories/booking.repository';
import { IEventRepository } from '../../../domain/repositories/event.repository';
import { IConfigRepository } from '../../../domain/repositories/config.repository';
import { ILedgerRepository } from '../../../domain/repositories/ledger.repository';
import { IPaymentGatewayProvider } from '../../../infrastructure/services/providers/payment-gateway.provider';
import { NotFoundError, ForbiddenError, BadRequestError } from '../../common/errors';
import { IRequest, IRequestHandler } from '../../common/mediator';
import { ICacheService } from '../../services/cache.service';
import { prisma } from '../../../config/prisma';

export class CancelBookingCommand implements IRequest<any> {
  readonly __tag = 'CancelBookingCommand';
  constructor(
    public readonly bookingId: string,
    public readonly userId: string,
    public readonly role: string,
    public readonly reason?: string
  ) {}
}

export class CancelBookingCommandHandler implements IRequestHandler<CancelBookingCommand, any> {
  constructor(
    private bookingRepo: IBookingRepository,
    private eventRepo: IEventRepository,
    private configRepo: IConfigRepository,
    private ledgerRepo: ILedgerRepository,
    private paymentGateway: IPaymentGatewayProvider,
    private cacheService: ICacheService
  ) {}

  async handle(command: CancelBookingCommand): Promise<any> {
    const { bookingId, userId, role, reason } = command;

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
    const now = new Date();
    const eventStartTime = new Date(event.startTime);
    const hoursDiff = (eventStartTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (event.status === 'COMPLETED' || event.status === 'CANCELED' || hoursDiff <= 0) {
      throw new BadRequestError('This event has already started, completed, or been canceled, so this booking cannot be canceled.');
    }

    const totalAmount = Number(booking.totalAmount);

    // Fetch refund matrix setting
    const setting = await this.configRepo.findPlatformSetting('refund_matrix');

    let refundPercentage = 100;
    if (setting && setting.value) {
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

    // Always update status to CANCELED (actual refund happens on Super Admin approval)
    const updatedBooking = await this.bookingRepo.update(bookingId, { status: BookingStatus.CANCELED });

    // Create a RefundRequest record
    const refundRequest = await prisma.refundRequest.create({
      data: {
        bookingId,
        reason: reason || 'Client cancellation request',
        refundAmount,
        refundPercentage,
        status: refundAmount > 0 ? 'PENDING' : 'APPROVED',
      },
    });

    // Clear search cache when seats count or booking status changes
    await this.cacheService.delPattern('events:search:*');

    return {
      booking: updatedBooking,
      refundAmount,
      refundPercentage,
      refundRequest,
    };
  }
}
