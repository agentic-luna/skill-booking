import { IEventReviewRepository } from '../../../domain/repositories/event-review.repository';
import { IRequest, IRequestHandler } from '../../common/mediator';

export class GetMyReviewForEventQuery implements IRequest<any> {
  readonly __tag = 'GetMyReviewForEventQuery';
  constructor(
    public readonly clientId: string,
    public readonly eventId: string
  ) {}
}

export class GetMyReviewForEventQueryHandler implements IRequestHandler<GetMyReviewForEventQuery, any> {
  constructor(private reviewRepo: IEventReviewRepository) {}

  async handle(query: GetMyReviewForEventQuery): Promise<any> {
    const { clientId, eventId } = query;
    const review = await this.reviewRepo.findUnique(clientId, eventId);
    return { review };
  }
}
