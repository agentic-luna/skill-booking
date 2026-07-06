import { DeliveryChannel, NotificationStatus } from '@prisma/client';
import { NotificationLog } from '../entities';

export interface INotificationRepository {
  findById(id: string): Promise<NotificationLog | null>;
  findMany(
    filters: {
      userId?: string;
      channel?: DeliveryChannel;
      status?: NotificationStatus;
    },
    skip?: number,
    take?: number
  ): Promise<NotificationLog[]>;
  count(filters: {
    userId?: string;
    channel?: DeliveryChannel;
    status?: NotificationStatus;
  }): Promise<number>;
  create(data: {
    userId: string;
    channel: DeliveryChannel;
    triggerEvent: string;
    recipient: string;
    content: string;
    status?: NotificationStatus;
    sentAt?: Date | null;
  }): Promise<NotificationLog>;
  update(
    id: string,
    data: {
      status?: NotificationStatus;
      errorMessage?: string | null;
      sentAt?: Date | null;
    }
  ): Promise<NotificationLog>;
}
