import { BoostedEvent } from '../../../domain/entities/boosted-event.entity';
import { IBoostedEventRepository } from '../../../domain/repositories/boosted-event.repository';
import { prisma } from '../../../config/prisma';

export class PrismaBoostedEventRepository implements IBoostedEventRepository {
  async upsert(
    eventId: string,
    data: { priority: number; startDate: Date; endDate: Date; isActive: boolean }
  ): Promise<BoostedEvent> {
    const item = await prisma.boostedEvent.upsert({
      where: { eventId },
      create: {
        eventId,
        priority: data.priority,
        startDate: data.startDate,
        endDate: data.endDate,
        isActive: data.isActive,
      },
      update: {
        priority: data.priority,
        startDate: data.startDate,
        endDate: data.endDate,
        isActive: data.isActive,
      },
      include: {
        event: true,
      },
    });
    return item as any;
  }

  async findActiveBoostedEvents(): Promise<BoostedEvent[]> {
    const now = new Date();
    const items = await prisma.boostedEvent.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      include: {
        event: true,
      },
      orderBy: { priority: 'desc' },
    });
    return items as any[];
  }

  async delete(eventId: string): Promise<boolean> {
    await prisma.boostedEvent.delete({
      where: { eventId },
    });
    return true;
  }
}
