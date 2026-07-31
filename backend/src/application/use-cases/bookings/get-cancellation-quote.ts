import { IBookingRepository } from '../../../domain/repositories/booking.repository';
import { IConfigRepository } from '../../../domain/repositories/config.repository';
import { NotFoundError, BadRequestError } from '../../common/errors';
import { IRequest, IRequestHandler } from '../../common/mediator';

export class GetCancellationQuoteQuery implements IRequest<any> {
  readonly __tag = 'GetCancellationQuoteQuery';
  constructor(
    public readonly bookingId: string,
    public readonly userId: string,
    public readonly role: string
  ) {}
}

export class GetCancellationQuoteQueryHandler implements IRequestHandler<GetCancellationQuoteQuery, any> {
  constructor(
    private bookingRepo: IBookingRepository,
    private configRepo: IConfigRepository
  ) {}

  async handle(query: GetCancellationQuoteQuery): Promise<any> {
    const { bookingId, userId, role } = query;

    const booking = await this.bookingRepo.findById(bookingId);
    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    if (booking.status === 'CANCELED' || booking.status === 'REFUNDED') {
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

    return {
      totalAmount,
      refundPercentage,
      refundAmount,
      hoursDiff,
    };
  }
}
