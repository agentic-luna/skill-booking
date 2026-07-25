import { BookingStatus } from '@prisma/client';
import { Booking } from '../entities';

export interface IBookingRepository {
  findById(id: string): Promise<any>;
  findFirstByRef(bookingRef: string): Promise<any>;
  findMany(filters: any): Promise<Booking[]>;
  create(data: {
    bookingRef: string;
    clientId: string;
    eventId: string;
    seatCount: number;
    totalAmount: number;
    status?: BookingStatus;
    commissionType?: string | null;
    platformValue?: number | null;
  }): Promise<Booking>;
  update(id: string, data: any): Promise<Booking>;
}
