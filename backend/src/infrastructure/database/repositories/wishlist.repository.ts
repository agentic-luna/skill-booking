import { IWishlistRepository } from '../../../domain/repositories/wishlist.repository';
import { Wishlist } from '../../../domain/entities';
import { prisma } from '../../../config/prisma';

export class PrismaWishlistRepository implements IWishlistRepository {
  async add(clientId: string, eventId: string): Promise<Wishlist> {
    const clientProfile = await prisma.clientProfile.upsert({
      where: { userId: clientId },
      update: {},
      create: { userId: clientId },
    });

    return prisma.wishlist.upsert({
      where: {
        clientId_eventId: { clientId, eventId },
      },
      create: { clientId, clientProfileId: clientProfile.id, eventId },
      update: { clientProfileId: clientProfile.id },
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
    });
  }

  async remove(clientId: string, eventId: string): Promise<boolean> {
    try {
      await prisma.wishlist.delete({
        where: {
          clientId_eventId: { clientId, eventId },
        },
      });
      return true;
    } catch {
      return false;
    }
  }

  async findByClient(clientId: string): Promise<Wishlist[]> {
    return prisma.wishlist.findMany({
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
    const item = await prisma.wishlist.findUnique({
      where: {
        clientId_eventId: { clientId, eventId },
      },
    });
    return !!item;
  }
}
