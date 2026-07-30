import { IEventReviewRepository } from '../../../domain/repositories/event-review.repository';
import { IEventRepository } from '../../../domain/repositories/event.repository';
import { IRequest, IRequestHandler } from '../../common/mediator';

export class GetEventReviewsQuery implements IRequest<any> {
  readonly __tag = 'GetEventReviewsQuery';
  constructor(public readonly eventId: string) {}
}

export class GetEventReviewsQueryHandler implements IRequestHandler<GetEventReviewsQuery, any> {
  constructor(
    private reviewRepo: IEventReviewRepository,
    private eventRepo: IEventRepository
  ) {}

  async handle(query: GetEventReviewsQuery): Promise<any> {
    const { eventId } = query;
    const event = await this.eventRepo.findById(eventId);
    
    let reviews: any[] = [];
    let stats = { averageRating: 4.8, totalReviews: 0 };

    if (event) {
      const res = await this.reviewRepo.findByHostId(event.hostId, 1, 100);
      reviews = res.reviews;
      stats = await this.reviewRepo.findAverageRatingForHost(event.hostId);
    } else {
      reviews = await this.reviewRepo.findByEventId(eventId);
      stats = await this.reviewRepo.findAverageRatingForEvent(eventId);
    }

    return {
      reviews,
      stats: {
        averageRating: stats.averageRating,
        totalReviews: stats.totalReviews,
      },
    };
  }
}
