import { prisma } from '../../config/prisma';

export class EventsService {
  static async getAllEvents() {
    return prisma.event.findMany({
      where: {
        status: 'APPROVED',
      },
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
      },
    });
  }

  static async getEventById(id: string) {
    return prisma.event.findUnique({
      where: { id },
      include: {
        host: true,
        commission: true,
      },
    });
  }
}
