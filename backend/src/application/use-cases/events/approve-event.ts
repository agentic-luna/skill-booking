import { CommissionType, EventStatus, TriggerEvent, DeliveryChannel, NotificationStatus } from '@prisma/client';
import { IEventRepository } from '../../../domain/repositories/event.repository';
import { IConfigRepository } from '../../../domain/repositories/config.repository';
import { IUserRepository } from '../../../domain/repositories/user.repository';
import { INotificationRepository } from '../../../domain/repositories/notification.repository';
import { IQueueService } from '../../services/queue.service';
import { ICacheService } from '../../services/cache.service';
import { IRequest, IRequestHandler } from '../../common/mediator';
import { NotFoundError } from '../../common/errors';
import { parseCommissionRate } from '../../../utils/commission-parser';
import {
  generateApproveEventEmailTemplate,
  generateApproveEventWhatsAppTemplate,
  generateApproveEventInAppTemplate,
} from '../../../constants/templates';

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
          const hostName = `${hostUser.firstName} ${hostUser.lastName}`;
          const formattedStartTime = new Date(updatedEvent.startTime).toLocaleString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });

          const approveData = {
            hostName,
            eventTitle: updatedEvent.title,
            eventId: updatedEvent.id,
            category: (updatedEvent as any).category || 'Workshop',
            mode: updatedEvent.mode,
            price: Number((updatedEvent as any).price || 0),
            totalSeats: Number(updatedEvent.totalSeats),
            commissionType: commission.commissionType,
            commissionValue: Number(commission.platformValue),
            formattedStartTime,
          };

          const emailContent = generateApproveEventEmailTemplate(approveData);
          const whatsappContent = generateApproveEventWhatsAppTemplate(approveData);
          const inAppContent = generateApproveEventInAppTemplate(approveData);

          const notificationTargets: { channel: DeliveryChannel; recipient: string; content: string }[] = [];

          notificationTargets.push({
            channel: DeliveryChannel.IN_APP,
            recipient: hostUser.email || hostUser.id,
            content: inAppContent,
          });

          if (hostUser.email) {
            notificationTargets.push({
              channel: DeliveryChannel.EMAIL,
              recipient: hostUser.email,
              content: emailContent,
            });
          }

          if (hostUser.phone) {
            notificationTargets.push({
              channel: DeliveryChannel.WHATSAPP,
              recipient: hostUser.phone,
              content: whatsappContent,
            });
          }

          for (const target of notificationTargets) {
            const log = await this.notificationRepo.create({
              userId: hostUser.id,
              channel: target.channel,
              triggerEvent: TriggerEvent.EVENT_APPROVED,
              recipient: target.recipient,
              content: target.content,
              status: target.channel === DeliveryChannel.IN_APP ? NotificationStatus.SENT : NotificationStatus.PENDING,
              sentAt: target.channel === DeliveryChannel.IN_APP ? new Date() : null,
            });

            if (target.channel !== DeliveryChannel.IN_APP) {
              await this.queueService.addNotificationJob(log.id);
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
