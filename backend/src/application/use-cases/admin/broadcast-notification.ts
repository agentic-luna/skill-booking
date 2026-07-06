import { DeliveryChannel, UserRole, UserStatus, NotificationStatus } from '@prisma/client';
import { INotificationRepository } from '../../../domain/repositories/notification.repository';
import { IUserRepository } from '../../../domain/repositories/user.repository';
import { IQueueService } from '../../services/queue.service';
import { IRequest, IRequestHandler } from '../../common/mediator';

export class BroadcastNotificationCommand implements IRequest<any> {
  readonly __tag = 'BroadcastNotificationCommand';
  constructor(
    public readonly channel: DeliveryChannel,
    public readonly cohort: 'ALL' | 'HOSTS' | 'CLIENTS' | 'INDIVIDUAL',
    public readonly targetUserId: string | null,
    public readonly triggerEvent: string,
    public readonly subject: string | null,
    public readonly bodyContent: string
  ) {}
}

export class BroadcastNotificationCommandHandler implements IRequestHandler<BroadcastNotificationCommand, any> {
  constructor(
    private notificationRepo: INotificationRepository,
    private userRepo: IUserRepository,
    private queueService: IQueueService
  ) {}

  async handle(command: BroadcastNotificationCommand): Promise<any> {
    const { channel, cohort, targetUserId, triggerEvent, subject, bodyContent } = command;
    let users = [];

    if (cohort === 'INDIVIDUAL' && targetUserId) {
      const user = await this.userRepo.findById(targetUserId);
      if (user) users.push(user);
    } else {
      const roleMap: Record<string, UserRole | undefined> = {
        ALL: undefined,
        HOSTS: UserRole.HOST,
        CLIENTS: UserRole.CLIENT,
      };
      const role = roleMap[cohort];
      users = await this.userRepo.findUsers({
        role,
        status: UserStatus.ACTIVE,
        deletedAt: null,
      });
    }

    const createdLogs = [];
    for (const u of users) {
      const recipient = channel === DeliveryChannel.EMAIL ? u.email : u.phone;
      const log = await this.notificationRepo.create({
        userId: u.id,
        channel,
        triggerEvent,
        recipient,
        content: bodyContent,
        status: channel === DeliveryChannel.IN_APP ? NotificationStatus.SENT : NotificationStatus.PENDING,
        sentAt: channel === DeliveryChannel.IN_APP ? new Date() : null,
      });
      createdLogs.push(log);

      if (channel !== DeliveryChannel.IN_APP) {
        await this.queueService.addNotificationJob(log.id);
      }
    }

    return {
      success: true,
      count: createdLogs.length,
    };
  }
}
