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
    ticketType: b.ticketType ? {
      ...b.ticketType,
      price: Number(b.ticketType.price),
      totalSeats: Number(b.ticketType.totalSeats),
      bookedSeats: Number(b.ticketType.bookedSeats),
    } : null,
    participants: Array.isArray(b.participants) ? b.participants.map((p: any) => ({
      ...p,
      ticketType: p.ticketType ? {
        ...p.ticketType,
        price: Number(p.ticketType.price),
        totalSeats: Number(p.ticketType.totalSeats),
        bookedSeats: Number(p.ticketType.bookedSeats),
      } : null,
    })) : [],
    event: b.event ? {
      ...b.event,
      availableSeats: Number(b.event.availableSeats),
      totalSeats: Number(b.event.totalSeats),
      version: Number(b.event.version),
      commission: b.event.commission ? {
        ...b.event.commission,
        platformValue: Number(b.event.commission.platformValue),
      } : null,
      instructor: b.event.instructor ? {
        id: b.event.instructor.id,
        name: b.event.instructor.name,
        bio: b.event.instructor.bio,
        photoUrl: b.event.instructor.photoUrl,
        companyName: b.event.instructor.companyName,
        facebook: b.event.instructor.facebook,
        instagram: b.event.instructor.instagram,
        linkedin: b.event.instructor.linkedin,
      } : null,
      venue: b.event.venue ? {
        id: b.event.venue.id,
        address: b.event.venue.address,
        meetingLink: b.event.venue.meetingLink,
      } : null,
      venueDetails: (b.event.instructor || b.event.venue || b.event.venueDetails) ? {
        address: b.event.venue?.address || '',
        meetingLink: b.event.venue?.meetingLink || '',
        district: (b.event.venueDetails as any)?.district || '',
        endDate: (b.event.venueDetails as any)?.endDate || '',
        instructorName: b.event.instructor?.name || '',
        companyName: b.event.instructor?.companyName || '',
        instructorBio: b.event.instructor?.bio || '',
        instructorPhoto: b.event.instructor?.photoUrl || '',
        instagram: b.event.instructor?.instagram || '',
        linkedin: b.event.instructor?.linkedin || '',
        facebook: b.event.instructor?.facebook || '',
      } : b.event.venueDetails,
    } : undefined,
  };
}

export class PrismaBookingRepository implements IBookingRepository {
  async findById(id: string): Promise<any> {
    const b = await prisma.booking.findUnique({
      where: { id },
      include: {
        ticketType: true,
        participants: {
          include: { ticketType: true },
        },
        client: true,
        event: {
          include: {
            commission: true,
            venue: true,
            instructor: true,
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
        ticketType: true,
        participants: {
          include: { ticketType: true },
        },
        client: true,
        event: {
          include: {
            commission: true,
            venue: true,
            instructor: true,
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
        ticketType: true,
        participants: {
          include: { ticketType: true },
        },
        client: true,
        event: {
          include: {
            commission: true,
            venue: true,
            instructor: true,
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
        ticketType: true,
        participants: {
          include: { ticketType: true },
        },
        client: true,
        event: {
          include: {
            commission: true,
            venue: true,
            instructor: true,
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
        ticketType: true,
        participants: {
          include: { ticketType: true },
        },
        event: {
          include: {
            venue: true,
            instructor: true,
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

    let participantRecords = Array.isArray(participants) && participants.length > 0 ? [...participants] : [];

    // Auto-fill missing participant slots up to seatCount using client account details
    if (participantRecords.length < data.seatCount) {
      const clientUser = await prisma.user.findUnique({ where: { id: data.clientId } });
      const clientName = clientUser ? `${clientUser.firstName || ''} ${clientUser.lastName || ''}`.trim() : 'Participant';
      const clientEmail = clientUser?.email || '';
      const clientMobile = clientUser?.phone || '';

      while (participantRecords.length < data.seatCount) {
        const isFirst = participantRecords.length === 0;
        participantRecords.push({
          isPrimary: isFirst,
          fullName: isFirst ? clientName : `${clientName} (Participant #${participantRecords.length + 1})`,
          email: clientEmail,
          mobile: clientMobile,
        });
      }
    }

    const createInput: any = {
      ...bookingData,
      participants: {
        create: participantRecords.map((p, idx) => ({
          isPrimary: p.isPrimary !== undefined ? Boolean(p.isPrimary) : idx === 0,
          fullName: String(p.fullName || `Participant #${idx + 1}`).trim(),
          email: String(p.email || '').trim(),
          mobile: String(p.mobile || '').trim(),
          dob: p.dob ? String(p.dob) : null,
          gender: p.gender ? String(p.gender) : null,
          city: p.city ? String(p.city) : null,
          state: p.state ? String(p.state) : null,
          country: p.country ? String(p.country) : 'India',
        })),
      },
    };

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
