import { IBoostedEventRepository } from '../../../domain/repositories/boosted-event.repository';
import { IRequest, IRequestHandler } from '../../common/mediator';

export class GetBoostedEventsQuery implements IRequest<any[]> {
  readonly __tag = 'GetBoostedEventsQuery';
}

export class GetBoostedEventsQueryHandler implements IRequestHandler<GetBoostedEventsQuery, any[]> {
  constructor(private boostedRepo: IBoostedEventRepository) {}

  async handle(query: GetBoostedEventsQuery): Promise<any[]> {
    return this.boostedRepo.findActiveBoostedEvents();
  }
}
