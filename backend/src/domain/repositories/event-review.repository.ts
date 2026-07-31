import { EventReview } from '../entities/event-review.entity';

export interface IEventReviewRepository {
  create(data: {
    eventId: string;
    bookingId?: string | null;
    clientId: string;
    rating: number;
    comment?: string | null;
  }): Promise<EventReview>;

  findByEventId(eventId: string): Promise<EventReview[]>;

  findByHostId(hostId: string, page?: number, limit?: number, rating?: number): Promise<{ reviews: EventReview[]; total: number }>;

  findAverageRatingForEvent(eventId: string): Promise<{ averageRating: number; totalReviews: number }>;

  findAverageRatingForHost(hostProfileId: string): Promise<{
    averageRating: number;
    totalReviews: number;
    breakdown?: Record<number, number>;
  }>;

  findUnique(clientId: string, eventId: string): Promise<EventReview | null>;

  update(id: string, rating: number, comment?: string | null): Promise<EventReview>;
}
