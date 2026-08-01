import { Event } from './event.entity';

export interface BoostedEvent {
  id: string;
  eventId: string;
  priority: number;
  tier?: string;
  price?: number;
  status?: string;
  impressions?: number;
  clicks?: number;
  conversions?: number;
  razorpayOrderId?: string | null;
  razorpayPaymentId?: string | null;
  razorpaySignature?: string | null;
  paymentMethod?: string | null;
  paymentCapturedAt?: Date | null;
  paymentGateway?: string | null;
  webhookProcessed?: boolean;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  event?: Event;
}
