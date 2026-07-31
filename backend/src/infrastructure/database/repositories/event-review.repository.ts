import { EventReview } from '../../../domain/entities/event-review.entity';
import { IEventReviewRepository } from '../../../domain/repositories/event-review.repository';
import { prisma } from '../../../config/prisma';

export class PrismaEventReviewRepository implements IEventReviewRepository {
  async create(data: {
    eventId: string;
    bookingId?: string | null;
    clientId: string;
    rating: number;
    comment?: string | null;
  }): Promise<EventReview> {
    const review = await prisma.review.upsert({
      where: {
        clientId_eventId: {
          clientId: data.clientId,
          eventId: data.eventId,
        },
      },
      update: {
        rating: data.rating,
        comment: data.comment || null,
        bookingId: data.bookingId || null,
      },
      create: {
        eventId: data.eventId,
        bookingId: data.bookingId || null,
        clientId: data.clientId,
        rating: data.rating,
        comment: data.comment || null,
      },
      include: {
        client: true,
      },
    });
    return review as any;
  }

  async findByEventId(eventId: string): Promise<EventReview[]> {
    const reviews = await prisma.review.findMany({
      where: { eventId },
      include: {
        client: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return reviews as any[];
  }

  async findByHostId(hostId: string, page = 1, limit = 5, rating?: number): Promise<{ reviews: EventReview[]; total: number }> {
    const skip = (page - 1) * limit;
    const whereClause: any = {
      event: {
        hostId,
      },
    };
    if (rating !== undefined) {
      whereClause.rating = rating;
    }

    const [reviews, total] = await prisma.$transaction([
      prisma.review.findMany({
        where: whereClause,
        include: {
          client: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.review.count({
        where: whereClause,
      }),
    ]);
    return { reviews: reviews as any[], total };
  }

  async findAverageRatingForEvent(eventId: string): Promise<{ averageRating: number; totalReviews: number }> {
    const aggregate = await prisma.review.aggregate({
      where: { eventId },
      _avg: { rating: true },
      _count: { rating: true },
    });
    return {
      averageRating: aggregate._avg.rating ? Math.round(aggregate._avg.rating * 10) / 10 : 0,
      totalReviews: aggregate._count.rating || 0,
    };
  }

  async findAverageRatingForHost(hostProfileId: string): Promise<{
    averageRating: number;
    totalReviews: number;
    breakdown: Record<number, number>;
  }> {
    const [aggregate, groupRating] = await prisma.$transaction([
      prisma.review.aggregate({
        where: {
          event: {
            hostId: hostProfileId,
          },
        },
        _avg: { rating: true },
        _count: { rating: true },
      }),
      prisma.review.groupBy({
        by: ['rating'],
        where: {
          event: {
            hostId: hostProfileId,
          },
        },
        _count: { rating: true },
        orderBy: {
          rating: 'asc',
        },
      }),
    ]);

    const breakdown: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const item of groupRating as any[]) {
      if (item && typeof item.rating === 'number') {
        breakdown[item.rating] = item._count?.rating || 0;
      }
    }

    return {
      averageRating: aggregate._avg.rating ? Math.round(aggregate._avg.rating * 10) / 10 : 0,
      totalReviews: aggregate._count.rating || 0,
      breakdown,
    };
  }

  async findUnique(clientId: string, eventId: string): Promise<EventReview | null> {
    const review = await prisma.review.findUnique({
      where: {
        clientId_eventId: {
          clientId,
          eventId,
        },
      },
    });
    return review as EventReview | null;
  }

  async update(id: string, rating: number, comment?: string | null): Promise<EventReview> {
    const review = await prisma.review.update({
      where: { id },
      data: {
        rating,
        comment,
      },
    });
    return review as EventReview;
  }
}
