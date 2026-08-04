import { CommissionType, EventStatus, TriggerEvent, DeliveryChannel } from '@prisma/client';
import { IEventRepository } from '../../../domain/repositories/event.repository';
import { IConfigRepository } from '../../../domain/repositories/config.repository';
import { IUserRepository } from '../../../domain/repositories/user.repository';
import { INotificationRepository } from '../../../domain/repositories/notification.repository';
import { IQueueService } from '../../services/queue.service';
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
    private configRepo: IConfigRepository,
    private userRepo: IUserRepository,
    private notificationRepo: INotificationRepository,
    private queueService: IQueueService
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

    // Trigger notification for event approval
    try {
      const hostProfile = await this.userRepo.findHostProfileById(updatedEvent.hostId);
      if (hostProfile) {
        const hostUser = await this.userRepo.findById(hostProfile.userId);
        if (hostUser) {
          const templates = await this.configRepo.findTemplates({
            triggerEvent: TriggerEvent.EVENT_APPROVED,
            isActive: true,
          });

          for (const temp of templates) {
            let content = temp.bodyContent;
            const userName = `${hostUser.firstName} ${hostUser.lastName}`;
            const replacements = {
              '{{userName}}': userName,
              '{{eventTitle}}': updatedEvent.title,
            };

            for (const [placeholder, value] of Object.entries(replacements)) {
              content = content.replace(new RegExp(placeholder, 'g'), value);
            }

            const recipient = temp.channel === DeliveryChannel.EMAIL ? hostUser.email : hostUser.phone;

            if (recipient) {
              const log = await this.notificationRepo.create({
                userId: hostUser.id,
                channel: temp.channel,
                triggerEvent: TriggerEvent.EVENT_APPROVED,
                recipient,
                content,
                status: temp.channel === DeliveryChannel.IN_APP ? 'SENT' : 'PENDING',
                sentAt: temp.channel === DeliveryChannel.IN_APP ? new Date() : null,
              });

              if (temp.channel !== DeliveryChannel.IN_APP) {
                await this.queueService.addNotificationJob(log.id);
              }
            }
          }
        }
      }
    } catch (err) {
      // Silent catch for notification dispatch failures
    }

    // Clear event search cache
    await this.cacheService.delPattern('events:search:*');

    return { event: updatedEvent, commission };
  }
}
