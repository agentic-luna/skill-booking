import { IEventReviewRepository } from '../../../domain/repositories/event-review.repository';
import { IRequest, IRequestHandler } from '../../common/mediator';

export class GetHostReviewsQuery implements IRequest<any> {
  readonly __tag = 'GetHostReviewsQuery';
  constructor(
    public readonly hostId: string,
    public readonly page = 1,
    public readonly limit = 5,
    public readonly rating?: number
  ) {}
}

export class GetHostReviewsQueryHandler implements IRequestHandler<GetHostReviewsQuery, any> {
  constructor(private reviewRepo: IEventReviewRepository) {}

  async handle(query: GetHostReviewsQuery): Promise<any> {
    const { hostId, page, limit, rating } = query;
    const result = await this.reviewRepo.findByHostId(hostId, page, limit, rating);
    const stats = await this.reviewRepo.findAverageRatingForHost(hostId);
    return {
      reviews: result.reviews,
      total: result.total,
      stats: {
        averageRating: stats.averageRating,
        totalReviews: stats.totalReviews,
        breakdown: stats.breakdown,
      },
    };
  }
}
