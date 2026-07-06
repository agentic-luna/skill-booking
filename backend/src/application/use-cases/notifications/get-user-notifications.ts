import { DeliveryChannel } from '@prisma/client';
import { INotificationRepository } from '../../../domain/repositories/notification.repository';
import { IRequest, IRequestHandler } from '../../common/mediator';

export class GetUserNotificationsQuery implements IRequest<any[]> {
  readonly __tag = 'GetUserNotificationsQuery';
  constructor(public readonly userId: string) {}
}

export class GetUserNotificationsQueryHandler implements IRequestHandler<GetUserNotificationsQuery, any[]> {
  constructor(private notificationRepo: INotificationRepository) {}

  async handle(query: GetUserNotificationsQuery): Promise<any[]> {
    const { userId } = query;
    return this.notificationRepo.findMany({
      userId,
      channel: DeliveryChannel.IN_APP,
    });
  }
}
