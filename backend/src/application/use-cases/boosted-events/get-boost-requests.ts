import { IBoostedEventRepository } from '../../../domain/repositories/boosted-event.repository';
import { IRequest, IRequestHandler } from '../../common/mediator';

export class GetBoostRequestsQuery implements IRequest<any[]> {
  readonly __tag = 'GetBoostRequestsQuery';
}

export class GetBoostRequestsQueryHandler implements IRequestHandler<GetBoostRequestsQuery, any[]> {
  constructor(private boostedRepo: IBoostedEventRepository) {}

  async handle(query: GetBoostRequestsQuery): Promise<any[]> {
    return this.boostedRepo.findAllBoostRequests();
  }
}
