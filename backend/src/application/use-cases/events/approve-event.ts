import { CommissionType, EventStatus } from '@prisma/client';
import { IEventRepository } from '../../../domain/repositories/event.repository';
import { IConfigRepository } from '../../../domain/repositories/config.repository';
import { ICacheService } from '../../services/cache.service';
import { IRequest, IRequestHandler } from '../../common/mediator';
import { NotFoundError } from '../../common/errors';
import { parseCommissionRate } from '../../../utils/commission-parser';

export class ApproveEventCommand implements IRequest<any> {
  readonly __tag = 'ApproveEventCommand';
  constructor(
    public readonly eventId: string,
    public readonly commissionType?: CommissionType,
    public readonly platformValue?: number
  ) {}
}

export class ApproveEventCommandHandler implements IRequestHandler<ApproveEventCommand, any> {
  constructor(
    private eventRepo: IEventRepository,
    private cacheService: ICacheService,
    private configRepo: IConfigRepository
  ) {}

  async handle(command: ApproveEventCommand): Promise<any> {
    const { eventId, commissionType, platformValue } = command;

    const event = await this.eventRepo.findById(eventId);
    if (!event) {
      throw new NotFoundError('Event not found');
    }

    let finalType: CommissionType;
    let finalValue: number;

    if (commissionType && platformValue !== undefined && platformValue !== null && !isNaN(platformValue)) {
      finalType = commissionType;
      finalValue = platformValue;
    } else {
      try {
        const setting = await this.configRepo.findPlatformSetting('commissionRate');
        const parsed = parseCommissionRate(setting?.value);
        finalType = parsed.commissionType;
        finalValue = parsed.platformValue;
      } catch (err) {
        finalType = CommissionType.PERCENTAGE;
        finalValue = 15;
      }
    }

    const commission = await this.eventRepo.upsertCommission(
      eventId,
      finalType,
      finalValue
    );

    const updatedEvent = await this.eventRepo.update(eventId, { status: EventStatus.APPROVED });

    // Clear event search cache
    await this.cacheService.delPattern('events:search:*');

    return { event: updatedEvent, commission };
  }
}
