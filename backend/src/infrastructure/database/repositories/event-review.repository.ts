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
    const review = await prisma.review.create({
      data: {
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

  async findAverageRatingForHost(hostProfileId: string): Promise<{ averageRating: number; totalReviews: number }> {
    const aggregate = await prisma.review.aggregate({
      where: {
        event: {
          hostId: hostProfileId,
        },
      },
      _avg: { rating: true },
      _count: { rating: true },
    });
    return {
      averageRating: aggregate._avg.rating ? Math.round(aggregate._avg.rating * 10) / 10 : 0,
      totalReviews: aggregate._count.rating || 0,
    };
  }
}
