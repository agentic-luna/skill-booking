import { BookingStatus } from '@prisma/client';
import { User } from './user.entity';
import { Event } from './event.entity';

export interface Booking {
  id: string;
  bookingRef: string;
  clientId: string;
  eventId: string;
  seatCount: number;
  totalAmount: number;
  status: BookingStatus;
  commissionType?: string | null;
  platformValue?: number | null;
  createdAt: Date;
  updatedAt: Date;
  client?: User;
  event?: Event;
}
