import { CommissionType, EventStatus } from '@prisma/client';
import { IEventRepository } from '../../../domain/repositories/event.repository';
import { ICacheService } from '../../services/cache.service';
import { IRequest, IRequestHandler } from '../../common/mediator';
import { NotFoundError } from '../../common/errors';

export class ApproveEventCommand implements IRequest<any> {
  readonly __tag = 'ApproveEventCommand';
  constructor(
    public readonly eventId: string,
    public readonly commissionType: CommissionType,
    public readonly platformValue: number
  ) {}
}

export class ApproveEventCommandHandler implements IRequestHandler<ApproveEventCommand, any> {
  constructor(
    private eventRepo: IEventRepository,
    private cacheService: ICacheService
  ) {}

  async handle(command: ApproveEventCommand): Promise<any> {
    const { eventId, commissionType, platformValue } = command;

    const event = await this.eventRepo.findById(eventId);
    if (!event) {
      throw new NotFoundError('Event not found');
    }

    const commission = await this.eventRepo.upsertCommission(
      eventId,
      commissionType,
      platformValue
    );

    const updatedEvent = await this.eventRepo.update(eventId, { status: EventStatus.APPROVED });

    // Clear event search cache
    await this.cacheService.delPattern('events:search:*');

    return { event: updatedEvent, commission };
  }
}
