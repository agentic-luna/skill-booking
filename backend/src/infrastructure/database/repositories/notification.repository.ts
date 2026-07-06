import { DeliveryChannel, NotificationStatus } from '@prisma/client';
import { NotificationLog } from '../../../domain/entities';
import { INotificationRepository } from '../../../domain/repositories/notification.repository';
import { prisma } from '../../../config/prisma';

export class PrismaNotificationRepository implements INotificationRepository {
  async findById(id: string): Promise<NotificationLog | null> {
    return prisma.notificationLog.findUnique({ where: { id } });
  }

  async findMany(
    filters: {
      userId?: string;
      channel?: DeliveryChannel;
      status?: NotificationStatus;
    },
    skip?: number,
    take?: number
  ): Promise<NotificationLog[]> {
    return prisma.notificationLog.findMany({
      where: filters,
      orderBy: { sentAt: 'desc' },
      skip,
      take,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  async count(filters: {
    userId?: string;
    channel?: DeliveryChannel;
    status?: NotificationStatus;
  }): Promise<number> {
    return prisma.notificationLog.count({ where: filters });
  }

  async create(data: {
    userId: string;
    channel: DeliveryChannel;
    triggerEvent: string;
    recipient: string;
    content: string;
    status?: NotificationStatus;
    sentAt?: Date | null;
  }): Promise<NotificationLog> {
    return prisma.notificationLog.create({ data });
  }

  async update(
    id: string,
    data: {
      status?: NotificationStatus;
      errorMessage?: string | null;
      sentAt?: Date | null;
    }
  ): Promise<NotificationLog> {
    return prisma.notificationLog.update({
      where: { id },
      data,
    });
  }
}
