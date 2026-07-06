export interface EventReview {
  id: string;
  eventId: string;
  bookingId: string;
  clientId: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  updatedAt: Date;
  client?: any;
  event?: any;
}
