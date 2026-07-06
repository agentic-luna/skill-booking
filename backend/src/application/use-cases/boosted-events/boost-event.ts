import { IBoostedEventRepository } from '../../../domain/repositories/boosted-event.repository';
import { IEventRepository } from '../../../domain/repositories/event.repository';
import { NotFoundError } from '../../common/errors';
import { IRequest, IRequestHandler } from '../../common/mediator';

export class BoostEventCommand implements IRequest<any> {
  readonly __tag = 'BoostEventCommand';
  constructor(
    public readonly eventId: string,
    public readonly priority: number,
    public readonly startDate: string,
    public readonly endDate: string,
    public readonly isActive: boolean = true
  ) {}
}

export class BoostEventCommandHandler implements IRequestHandler<BoostEventCommand, any> {
  constructor(
    private boostedRepo: IBoostedEventRepository,
    private eventRepo: IEventRepository
  ) {}

  async handle(command: BoostEventCommand): Promise<any> {
    const { eventId, priority, startDate, endDate, isActive } = command;

    const event = await this.eventRepo.findById(eventId);
    if (!event) {
      throw new NotFoundError('Event not found');
    }

    const start = startDate ? new Date(startDate) : new Date();
    const end = endDate ? new Date(endDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    return this.boostedRepo.upsert(eventId, {
      priority: Number(priority || 1),
      startDate: start,
      endDate: end,
      isActive: isActive !== undefined ? isActive : true,
    });
  }
}
