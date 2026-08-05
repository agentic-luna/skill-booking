import { BookingStatus } from '@prisma/client';
import { Booking } from '../../../domain/entities';
import { IBookingRepository } from '../../../domain/repositories/booking.repository';
import { prisma } from '../../../config/prisma';

function mapBooking(b: any): any {
  if (!b) return null;
  return {
    ...b,
    totalAmount: Number(b.totalAmount),
    seatCount: Number(b.seatCount),
    platformValue: b.platformValue ? Number(b.platformValue) : null,
    event: b.event ? {
      ...b.event,
      availableSeats: Number(b.event.availableSeats),
      totalSeats: Number(b.event.totalSeats),
      version: Number(b.event.version),
      commission: b.event.commission ? {
        ...b.event.commission,
        platformValue: Number(b.event.commission.platformValue),
      } : null,
    } : undefined,
  };
}

export class PrismaBookingRepository implements IBookingRepository {
  async findById(id: string): Promise<any> {
    const b = await prisma.booking.findUnique({
      where: { id },
      include: {
        participants: true,
        event: {
          include: {
            commission: true,
            host: {
              include: {
                user: true,
              },
            },
          },
        },
        refundRequest: true,
      },
    });
    return mapBooking(b);
  }

  async findFirstByRef(bookingRef: string): Promise<any> {
    const b = await prisma.booking.findFirst({
      where: { bookingRef },
      include: {
        participants: true,
        client: true,
        event: {
          include: {
            commission: true,
            host: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });
    return mapBooking(b);
  }

  async findByRazorpayOrderId(razorpayOrderId: string): Promise<any> {
    if (!razorpayOrderId) return null;
    const b = await prisma.booking.findUnique({
      where: { razorpayOrderId },
      include: {
        participants: true,
        client: true,
        event: {
          include: {
            commission: true,
            host: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });
    return mapBooking(b);
  }

  async findByRazorpayPaymentId(razorpayPaymentId: string): Promise<any> {
    if (!razorpayPaymentId) return null;
    const b = await prisma.booking.findFirst({
      where: { razorpayPaymentId },
      include: {
        participants: true,
        client: true,
        event: {
          include: {
            commission: true,
            host: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });
    return mapBooking(b);
  }

  async findMany(filters: any): Promise<Booking[]> {
    const list = await prisma.booking.findMany({
      where: filters,
      include: {
        participants: true,
        event: {
          include: {
            host: {
              include: {
                user: true,
              },
            },
          },
        },
        client: true,
        refundRequest: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return list.map(mapBooking);
  }

  async create(data: {
    bookingRef: string;
    clientId: string;
    eventId: string;
    seatCount: number;
    totalAmount: number;
    status?: BookingStatus;
    commissionType?: any;
    platformValue?: number | null;
    razorpayOrderId?: string | null;
    razorpayPaymentId?: string | null;
    paymentMethod?: string | null;
    paymentGateway?: string | null;
    webhookProcessed?: boolean;
    participants?: any[];
  }): Promise<Booking> {
    const { participants, ...bookingData } = data;

    const createInput: any = {
      ...bookingData,
    };

    if (Array.isArray(participants) && participants.length > 0) {
      createInput.participants = {
        create: participants.map((p, idx) => ({
          isPrimary: p.isPrimary !== undefined ? Boolean(p.isPrimary) : idx === 0,
          fullName: String(p.fullName || '').trim(),
          email: String(p.email || '').trim(),
          mobile: String(p.mobile || '').trim(),
          dob: p.dob ? String(p.dob) : null,
          gender: p.gender ? String(p.gender) : null,
          city: p.city ? String(p.city) : null,
          state: p.state ? String(p.state) : null,
          country: p.country ? String(p.country) : 'India',
        })),
      };
    }

    const created = await prisma.booking.create({
      data: createInput,
      include: { participants: true },
    });
    return mapBooking(created);
  }

  async update(id: string, data: any): Promise<Booking> {
    const updated = await prisma.booking.update({
      where: { id },
      data,
      include: { participants: true },
    });
    return mapBooking(updated);
  }

  async updatePaymentDetails(bookingId: string, details: {
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    paymentMethod?: string;
    paymentCapturedAt?: Date;
    paymentGateway?: string;
    webhookProcessed?: boolean;
  }): Promise<Booking> {
    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: details,
      include: { participants: true },
    });
    return mapBooking(updated);
  }

  async markPaymentCaptured(bookingId: string, details: {
    razorpayPaymentId: string;
    paymentMethod?: string;
    paymentCapturedAt?: Date;
    paymentGateway?: string;
  }): Promise<Booking> {
    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: BookingStatus.CONFIRMED,
        razorpayPaymentId: details.razorpayPaymentId,
        paymentMethod: details.paymentMethod || 'RAZORPAY',
        paymentCapturedAt: details.paymentCapturedAt || new Date(),
        paymentGateway: details.paymentGateway || 'RAZORPAY',
        webhookProcessed: true,
      },
      include: { participants: true },
    });
    return mapBooking(updated);
  }
}
