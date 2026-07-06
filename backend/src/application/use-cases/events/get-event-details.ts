import { IEventRepository } from '../../../domain/repositories/event.repository';
import { IRequest, IRequestHandler } from '../../common/mediator';

import { NotFoundError } from '../../common/errors';

export class GetEventDetailsQuery implements IRequest<any> {
  readonly __tag = 'GetEventDetailsQuery';
  constructor(public readonly eventId: string) {}
}

export class GetEventDetailsQueryHandler implements IRequestHandler<GetEventDetailsQuery, any> {
  constructor(private eventRepo: IEventRepository) {}

  async handle(query: GetEventDetailsQuery): Promise<any> {
    const { eventId } = query;
    const event = await this.eventRepo.findById(eventId);
    if (!event) {
      throw new NotFoundError('Event not found');
    }
    return event;
  }
}
