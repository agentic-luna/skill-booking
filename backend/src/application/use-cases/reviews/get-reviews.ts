import { IEventReviewRepository } from '../../../domain/repositories/event-review.repository';
import { IRequest, IRequestHandler } from '../../common/mediator';

export class GetEventReviewsQuery implements IRequest<any> {
  readonly __tag = 'GetEventReviewsQuery';
  constructor(public readonly eventId: string) {}
}

export class GetEventReviewsQueryHandler implements IRequestHandler<GetEventReviewsQuery, any> {
  constructor(private reviewRepo: IEventReviewRepository) {}

  async handle(query: GetEventReviewsQuery): Promise<any> {
    const { eventId } = query;
    const reviews = await this.reviewRepo.findByEventId(eventId);
    const stats = await this.reviewRepo.findAverageRatingForEvent(eventId);
    return {
      reviews,
      stats,
    };
  }
}
