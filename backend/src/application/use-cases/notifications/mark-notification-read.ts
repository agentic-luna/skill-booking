import { INotificationRepository } from '../../../domain/repositories/notification.repository';
import { IRequest, IRequestHandler } from '../../common/mediator';

import { NotFoundError } from '../../common/errors';
import { NotificationStatus } from '@prisma/client';

export class MarkNotificationReadCommand implements IRequest<any> {
  readonly __tag = 'MarkNotificationReadCommand';
  constructor(
    public readonly id: string,
    public readonly userId: string
  ) {}
}

export class MarkNotificationReadCommandHandler implements IRequestHandler<MarkNotificationReadCommand, any> {
  constructor(private notificationRepo: INotificationRepository) {}

  async handle(command: MarkNotificationReadCommand): Promise<any> {
    const { id, userId } = command;
    const log = await this.notificationRepo.findById(id);

    if (!log || log.userId !== userId) {
      throw new NotFoundError('Notification log not found or access denied');
    }

    const updatedLog = await this.notificationRepo.update(id, {
      status: NotificationStatus.READ,
    });

    return updatedLog;
  }
}
