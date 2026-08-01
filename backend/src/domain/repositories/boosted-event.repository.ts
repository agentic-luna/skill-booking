import { BoostedEvent } from '../entities/boosted-event.entity';

export interface IBoostedEventRepository {
  upsert(eventId: string, data: {
    priority: number;
    tier?: string;
    price?: number;
    startDate: Date;
    endDate: Date;
    isActive: boolean;
    razorpayOrderId?: string | null;
    razorpayPaymentId?: string | null;
    paymentMethod?: string | null;
    paymentGateway?: string | null;
    webhookProcessed?: boolean;
  }): Promise<BoostedEvent>;

  findActiveBoostedEvents(): Promise<BoostedEvent[]>;
  update(id: string, data: any): Promise<BoostedEvent>;
  findAllBoostRequests(): Promise<BoostedEvent[]>;
  findById(id: string): Promise<BoostedEvent | null>;
  findByRazorpayOrderId(razorpayOrderId: string): Promise<BoostedEvent | null>;
  findByRazorpayPaymentId(razorpayPaymentId: string): Promise<BoostedEvent | null>;
  updatePaymentDetails(id: string, details: {
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    paymentMethod?: string;
    paymentCapturedAt?: Date;
    paymentGateway?: string;
    webhookProcessed?: boolean;
  }): Promise<BoostedEvent>;
  markPaymentCaptured(id: string, details: {
    razorpayPaymentId: string;
    paymentMethod?: string;
    paymentCapturedAt?: Date;
    paymentGateway?: string;
    status?: 'ACTIVE' | 'APPROVED';
    isActive?: boolean;
  }): Promise<BoostedEvent>;

  delete(eventId: string): Promise<boolean>;
}
