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

  findByHostId(hostId: string, page?: number, limit?: number): Promise<{ reviews: EventReview[]; total: number }>;

  findAverageRatingForEvent(eventId: string): Promise<{ averageRating: number; totalReviews: number }>;

  findAverageRatingForHost(hostProfileId: string): Promise<{ averageRating: number; totalReviews: number }>;
}
