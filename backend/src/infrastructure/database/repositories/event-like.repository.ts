import { IEventLikeRepository } from '../../../domain/repositories/event-like.repository';
import { EventLike } from '../../../domain/entities';
import { prisma } from '../../../config/prisma';

export class PrismaEventLikeRepository implements IEventLikeRepository {
  async toggleLike(clientId: string, eventId: string): Promise<{ liked: boolean; like?: EventLike }> {
    const existing = await prisma.eventLike.findUnique({
      where: {
        clientId_eventId: { clientId, eventId },
      },
    });

    if (existing) {
      await prisma.eventLike.delete({
        where: { id: existing.id },
      });
      return { liked: false };
    }

    const like = await prisma.eventLike.create({
      data: { clientId, eventId },
      include: {
        event: true,
      },
    });

    return { liked: true, like };
  }

  async findByClient(clientId: string): Promise<EventLike[]> {
    return prisma.eventLike.findMany({
      where: { clientId },
      include: {
        event: {
          include: {
            host: {
              select: {
                user: {
                  select: { firstName: true, lastName: true },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async exists(clientId: string, eventId: string): Promise<boolean> {
    const item = await prisma.eventLike.findUnique({
      where: {
        clientId_eventId: { clientId, eventId },
      },
    });
    return !!item;
  }

  async getLikeCountForEvent(eventId: string): Promise<number> {
    return prisma.eventLike.count({
      where: { eventId },
    });
  }
}
