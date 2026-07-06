import { EventMode, EventStatus, CommissionType } from '@prisma/client';
import { Event, EventCommission } from '../../../domain/entities';
import { IEventRepository } from '../../../domain/repositories/event.repository';
import { prisma } from '../../../config/prisma';

function mapEvent(e: any): any {
  if (!e) return null;
  return {
    ...e,
    availableSeats: Number(e.availableSeats),
    totalSeats: Number(e.totalSeats),
    version: Number(e.version),
    commission: e.commission ? mapCommission(e.commission) : null,
  };
}

function mapCommission(c: any): EventCommission {
  if (!c) return c;
  return {
    ...c,
    platformValue: Number(c.platformValue),
  };
}

export class PrismaEventRepository implements IEventRepository {
  async findById(id: string): Promise<any> {
    const e = await prisma.event.findUnique({
      where: { id },
      include: {
        host: {
          select: {
            id: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        commission: true,
      },
    });
    return mapEvent(e);
  }

  async findMany(filters: {
    title?: string;
    mode?: EventMode;
    hostId?: string;
    startTimeFrom?: string;
    status?: EventStatus;
  }): Promise<any[]> {
    const where: any = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.title) {
      where.title = {
        contains: filters.title,
        mode: 'insensitive',
      };
    }

    if (filters.mode) {
      where.mode = filters.mode;
    }

    if (filters.hostId) {
      where.hostId = filters.hostId;
    }

    if (filters.startTimeFrom) {
      where.startTime = {
        gte: new Date(filters.startTimeFrom),
      };
    }

    const events = await prisma.event.findMany({
      where,
      include: {
        host: {
          select: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        commission: true,
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    return events.map(mapEvent);
  }

  async create(data: {
    hostId: string;
    title: string;
    posterUrl: string;
    mode: EventMode;
    venueDetails?: any;
    startTime: Date;
    totalSeats: number;
    availableSeats: number;
    status?: EventStatus;
    version?: number;
  }): Promise<Event> {
    const created = await prisma.event.create({ data });
    return mapEvent(created);
  }

  async update(id: string, data: any): Promise<Event> {
    const updated = await prisma.event.update({
      where: { id },
      data,
    });
    return mapEvent(updated);
  }

  async findPendingEvents(): Promise<any[]> {
    const events = await prisma.event.findMany({
      where: { status: EventStatus.PENDING },
      include: {
        host: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                phone: true,
              },
            },
          },
        },
      },
    });
    return events.map(mapEvent);
  }

  async upsertCommission(
    eventId: string,
    commissionType: CommissionType,
    platformValue: number
  ): Promise<EventCommission> {
    const comm = await prisma.eventCommission.upsert({
      where: { eventId },
      update: {
        commissionType,
        platformValue,
      },
      create: {
        eventId,
        commissionType,
        platformValue,
      },
    });
    return mapCommission(comm);
  }

  async decrementSeats(id: string, seatCount: number, currentVersion: number): Promise<boolean> {
    const updateResult = await prisma.event.updateMany({
      where: {
        id,
        version: currentVersion,
        availableSeats: { gte: seatCount },
      },
      data: {
        availableSeats: { decrement: seatCount },
        version: { increment: 1 },
      },
    });

    return updateResult.count > 0;
  }

  async incrementSeats(id: string, seatCount: number): Promise<Event> {
    const updated = await prisma.event.update({
      where: { id },
      data: {
        availableSeats: { increment: seatCount },
        version: { increment: 1 },
      },
    });
    return mapEvent(updated);
  }
}
