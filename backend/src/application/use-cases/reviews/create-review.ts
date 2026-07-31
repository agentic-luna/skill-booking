import { IEventReviewRepository } from '../../../domain/repositories/event-review.repository';
import { IBookingRepository } from '../../../domain/repositories/booking.repository';
import { IEventRepository } from '../../../domain/repositories/event.repository';
import { IUserRepository } from '../../../domain/repositories/user.repository';
import { BadRequestError, NotFoundError, ForbiddenError } from '../../common/errors';
import { IRequest, IRequestHandler } from '../../common/mediator';

export class CreateEventReviewCommand implements IRequest<any> {
  readonly __tag = 'CreateEventReviewCommand';
  constructor(
    public readonly clientId: string,
    public readonly data: {
      eventId: string;
      bookingId?: string;
      rating: number;
      comment?: string;
    }
  ) {}
}

export class CreateEventReviewCommandHandler implements IRequestHandler<CreateEventReviewCommand, any> {
  constructor(
    private reviewRepo: IEventReviewRepository,
    private bookingRepo: IBookingRepository,
    private eventRepo: IEventRepository,
    private userRepo: IUserRepository
  ) {}

  async handle(command: CreateEventReviewCommand): Promise<any> {
    const { clientId, data } = command;

    if (data.rating < 1 || data.rating > 5) {
      throw new BadRequestError('Rating must be an integer or decimal between 1 and 5.');
    }

    const event = await this.eventRepo.findById(data.eventId);
    if (!event) {
      throw new NotFoundError('Event not found');
    }

    // Verify client has a confirmed booking for this event
    const bookings = await this.bookingRepo.findMany({
      clientId,
      eventId: data.eventId,
      status: 'CONFIRMED',
    });

    if (bookings.length === 0) {
      throw new ForbiddenError('Only attended clients with a confirmed booking can review this event.');
    }

    const existingReview = await this.reviewRepo.findUnique(clientId, data.eventId);

    let review;
    if (existingReview) {
      review = await this.reviewRepo.update(
        existingReview.id,
        Number(data.rating),
        data.comment || null
      );
    } else {
      review = await this.reviewRepo.create({
        eventId: data.eventId,
        bookingId: data.bookingId || bookings[0].id,
        clientId,
        rating: Number(data.rating),
        comment: data.comment || null,
      });
    }

    // Recalculate event average rating
    const eventStats = await this.reviewRepo.findAverageRatingForEvent(data.eventId);
    
    // Recalculate host overall average rating
    const hostStats = await this.reviewRepo.findAverageRatingForHost(event.hostId);

    return {
      review,
      eventRating: eventStats,
      hostRating: hostStats,
    };
  }
}
