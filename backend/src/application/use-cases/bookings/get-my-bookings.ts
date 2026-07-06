import { IRequest, IRequestHandler } from '../../common/mediator';
import { IBookingRepository } from '../../../domain/repositories/booking.repository';

export class GetMyBookingsQuery implements IRequest<any> {
  readonly __tag = 'GetMyBookingsQuery';
  constructor(public readonly clientId: string) {}
}

export class GetMyBookingsQueryHandler implements IRequestHandler<GetMyBookingsQuery, any> {
  constructor(private bookingRepo: IBookingRepository) {}

  async handle(query: GetMyBookingsQuery): Promise<any> {
    const { clientId } = query;
    const bookings = await this.bookingRepo.findMany({ clientId });
    return {
      bookings,
      count: bookings.length,
    };
  }
}
