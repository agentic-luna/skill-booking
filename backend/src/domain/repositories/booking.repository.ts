import { BookingStatus } from '@prisma/client';
import { Booking } from '../entities';

export interface IBookingRepository {
  findById(id: string): Promise<any>;
  findFirstByRef(bookingRef: string): Promise<any>;
  findByRazorpayOrderId(razorpayOrderId: string): Promise<any>;
  findByRazorpayPaymentId(razorpayPaymentId: string): Promise<any>;
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
    razorpayOrderId?: string | null;
    razorpayPaymentId?: string | null;
    paymentMethod?: string | null;
    paymentGateway?: string | null;
    webhookProcessed?: boolean;
  }): Promise<Booking>;
  update(id: string, data: any): Promise<Booking>;
  updatePaymentDetails(bookingId: string, details: {
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    paymentMethod?: string;
    paymentCapturedAt?: Date;
    paymentGateway?: string;
    webhookProcessed?: boolean;
  }): Promise<Booking>;
  markPaymentCaptured(bookingId: string, details: {
    razorpayPaymentId: string;
    paymentMethod?: string;
    paymentCapturedAt?: Date;
    paymentGateway?: string;
  }): Promise<Booking>;
}
