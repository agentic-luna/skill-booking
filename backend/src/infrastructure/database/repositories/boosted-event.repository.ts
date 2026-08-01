import { BoostedEvent } from '../../../domain/entities/boosted-event.entity';
import { IBoostedEventRepository } from '../../../domain/repositories/boosted-event.repository';
import { prisma } from '../../../config/prisma';

export class PrismaBoostedEventRepository implements IBoostedEventRepository {
  async upsert(
    eventId: string,
    data: { priority: number; tier?: string; price?: number; startDate: Date; endDate: Date; isActive: boolean }
  ): Promise<BoostedEvent> {
    const item = await prisma.boostedEvent.upsert({
      where: { eventId },
      create: {
        eventId,
        priority: data.priority,
        tier: data.tier as any,
        price: data.price,
        startDate: data.startDate,
        endDate: data.endDate,
        isActive: data.isActive,
      },
      update: {
        priority: data.priority,
        tier: data.tier as any,
        price: data.price,
        startDate: data.startDate,
        endDate: data.endDate,
        isActive: data.isActive,
      },
      include: {
        event: true,
      },
    });
    return item as any;
  }

  
  async update(id: string, data: any): Promise<BoostedEvent> {
    return prisma.boostedEvent.update({
      where: { id },
      data
    }) as any;
  }
  
  async findAllBoostRequests(): Promise<BoostedEvent[]> {
    return prisma.boostedEvent.findMany({
      include: {
        event: {
          include: {
            host: {
              include: { user: true }
            }
          }
        }
      }
    }) as any;
  }
  
  async findActiveBoostedEvents(): Promise<BoostedEvent[]> {
    const now = new Date();
    const items = await prisma.boostedEvent.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      include: {
        event: true,
      },
      orderBy: { priority: 'desc' },
    });
    return items as any[];
  }

  async findById(id: string): Promise<BoostedEvent | null> {
    return prisma.boostedEvent.findUnique({
      where: { id },
      include: { event: true },
    }) as any;
  }

  async findByRazorpayOrderId(razorpayOrderId: string): Promise<BoostedEvent | null> {
    if (!razorpayOrderId) return null;
    return prisma.boostedEvent.findUnique({
      where: { razorpayOrderId },
      include: { event: true },
    }) as any;
  }

  async findByRazorpayPaymentId(razorpayPaymentId: string): Promise<BoostedEvent | null> {
    if (!razorpayPaymentId) return null;
    return prisma.boostedEvent.findFirst({
      where: { razorpayPaymentId },
      include: { event: true },
    }) as any;
  }

  async updatePaymentDetails(id: string, details: {
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    paymentMethod?: string;
    paymentCapturedAt?: Date;
    paymentGateway?: string;
    webhookProcessed?: boolean;
  }): Promise<BoostedEvent> {
    return prisma.boostedEvent.update({
      where: { id },
      data: details,
      include: { event: true },
    }) as any;
  }

  async markPaymentCaptured(id: string, details: {
    razorpayPaymentId: string;
    paymentMethod?: string;
    paymentCapturedAt?: Date;
    paymentGateway?: string;
    status?: 'ACTIVE' | 'APPROVED';
    isActive?: boolean;
  }): Promise<BoostedEvent> {
    return prisma.boostedEvent.update({
      where: { id },
      data: {
        status: (details.status as any) || 'ACTIVE',
        isActive: details.isActive !== undefined ? details.isActive : true,
        razorpayPaymentId: details.razorpayPaymentId,
        paymentMethod: details.paymentMethod || 'RAZORPAY',
        paymentCapturedAt: details.paymentCapturedAt || new Date(),
        paymentGateway: details.paymentGateway || 'RAZORPAY',
        webhookProcessed: true,
      },
      include: { event: true },
    }) as any;
  }

  async delete(eventId: string): Promise<boolean> {
    await prisma.boostedEvent.delete({
      where: { eventId },
    });
    return true;
  }
}
