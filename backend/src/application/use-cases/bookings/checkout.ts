import { EventStatus, BookingStatus } from '@prisma/client';
import { IEventRepository } from '../../../domain/repositories/event.repository';
import { IBookingRepository } from '../../../domain/repositories/booking.repository';
import { ICacheService } from '../../services/cache.service';
import { ICommunicationService } from '../../services/communication.service';
import { BadRequestError, NotFoundError, ConflictError } from '../../common/errors';
import { IRequest, IRequestHandler } from '../../common/mediator';
import { prisma } from '../../../config/prisma';

export class CheckoutCommand implements IRequest<any> {
  readonly __tag = 'CheckoutCommand';
  constructor(
    public readonly clientId: string,
    public readonly eventId: string,
    public readonly seatCount?: number,
    public readonly ticketTypeId?: string,
    public readonly customAmount?: number,
    public readonly participants?: any[],
    public readonly items?: Array<{ ticketTypeId: string; quantity: number; participants?: any[] }>
  ) {}
}

export class CheckoutCommandHandler implements IRequestHandler<CheckoutCommand, any> {
  constructor(
    private eventRepo: IEventRepository,
    private bookingRepo: IBookingRepository,
    private cacheService: ICacheService,
    private commsService: ICommunicationService
  ) {}

  async handle(command: CheckoutCommand): Promise<any> {
    const { clientId, eventId } = command;

    const event = await this.eventRepo.findById(eventId);
    if (!event) {
      throw new NotFoundError('Event not found');
    }

    if (event.status !== EventStatus.APPROVED) {
      throw new BadRequestError('Event booking is not open');
    }

    if (event.startTime && new Date(event.startTime) < new Date()) {
      throw new BadRequestError('This event has already started/finished and cannot be booked.');
    }

    // 1. Gather all requested tickets and their participants
    let ticketsList: Array<{
      ticketTypeId: string | null;
      fullName?: string;
      email?: string;
      mobile?: string;
      dob?: string;
      gender?: string;
      city?: string;
      state?: string;
      country?: string;
      isPrimary?: boolean;
    }> = [];

    if (Array.isArray(command.items) && command.items.length > 0) {
      for (const item of command.items) {
        const qty = Number(item.quantity) || 1;
        const itemParticipants = Array.isArray(item.participants) ? item.participants : [];
        for (let i = 0; i < qty; i++) {
          const p = itemParticipants[i] || {};
          ticketsList.push({
            ticketTypeId: item.ticketTypeId,
            ...p,
          });
        }
      }
    } else if (Array.isArray(command.participants) && command.participants.length > 0) {
      for (const p of command.participants) {
        ticketsList.push({
          ticketTypeId: p.ticketTypeId || command.ticketTypeId || null,
          ...p,
        });
      }
    } else {
      const count = Number(command.seatCount) || 1;
      for (let i = 0; i < count; i++) {
        ticketsList.push({
          ticketTypeId: command.ticketTypeId || null,
        });
      }
    }

    if (ticketsList.length === 0) {
      throw new BadRequestError('At least one seat must be booked.');
    }

    const totalSeatCount = ticketsList.length;

    // 2. Group quantities per ticket type and fetch DB records
    const qtyByTicketTypeId = new Map<string, number>();
    for (const t of ticketsList) {
      if (t.ticketTypeId) {
        qtyByTicketTypeId.set(t.ticketTypeId, (qtyByTicketTypeId.get(t.ticketTypeId) || 0) + 1);
      }
    }

    const ticketTypesMap = new Map<string, any>();
    if (qtyByTicketTypeId.size > 0) {
      const dbTicketTypes = await prisma.eventTicketType.findMany({
        where: {
          id: { in: Array.from(qtyByTicketTypeId.keys()) },
          eventId: eventId,
        },
      });

      for (const tt of dbTicketTypes) {
        ticketTypesMap.set(tt.id, tt);
      }

      for (const ttId of qtyByTicketTypeId.keys()) {
        if (!ticketTypesMap.has(ttId)) {
          throw new NotFoundError(`Ticket type ID "${ttId}" was not found for this event.`);
        }
      }
    }

    // 3. Calculate total base price across all ticket items
    let calculatedBaseAmount = 0;
    if (qtyByTicketTypeId.size > 0) {
      for (const [ttId, qty] of qtyByTicketTypeId.entries()) {
        const tt = ticketTypesMap.get(ttId);
        calculatedBaseAmount += qty * Number(tt.price);
      }
    } else {
      calculatedBaseAmount = totalSeatCount * (Number(event.price) || 0);
    }

    const baseAmount = command.customAmount !== undefined ? command.customAmount : calculatedBaseAmount;
    
    // Calculate platform fee commission if defined
    let platformFee = 0;
    if (event.commission) {
      if (event.commission.commissionType === 'PERCENTAGE') {
        const platformValue = Number(event.commission.platformValue) || 0;
        platformFee = Math.round(baseAmount * (platformValue / 100) * 100) / 100;
      }
    }
    
    const totalAmount = baseAmount + platformFee;
    const bookingRef = `BK-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    // 4. Wrap seat updates and booking creation in a single transaction
    const booking = await prisma.$transaction(async (tx) => {
      // 4a. Perform atomic conditional UPDATE for each requested ticket type
      if (qtyByTicketTypeId.size > 0) {
        for (const [ttId, qty] of qtyByTicketTypeId.entries()) {
          const tt = ticketTypesMap.get(ttId);
          const updatedCount = await tx.$executeRaw`
            UPDATE "event_ticket_types"
            SET "booked_seats" = "booked_seats" + ${qty},
                "updated_at" = NOW()
            WHERE "id" = ${ttId}::uuid
              AND "event_id" = ${eventId}::uuid
              AND ("total_seats" - "booked_seats") >= ${qty}
          `;

          if (updatedCount === 0) {
            throw new ConflictError(
              `Not enough seats remaining for ticket type "${tt.name}". Requested ${qty}, but only ${Number(tt.totalSeats) - Number(tt.bookedSeats)} available.`
            );
          }
        }
      }

      // 4b. Perform atomic conditional UPDATE on overall event seats
      const eventUpdatedCount = await tx.$executeRaw`
        UPDATE "events"
        SET "availableSeats" = "availableSeats" - ${totalSeatCount},
            "version" = "version" + 1,
            "updatedAt" = NOW()
        WHERE "id" = ${eventId}::uuid
          AND "availableSeats" >= ${totalSeatCount}
      `;

      if (eventUpdatedCount === 0) {
        throw new ConflictError(`Not enough seats available for event "${event.title}".`);
      }

      // 4c. Format participant records & associate each participant with their ticket type
      const clientUser = await tx.user.findUnique({ where: { id: clientId } });
      const clientName = clientUser ? `${clientUser.firstName || ''} ${clientUser.lastName || ''}`.trim() : 'Participant';
      const clientEmail = clientUser?.email || '';
      const clientMobile = clientUser?.phone || '';

      const participantRecords = ticketsList.map((t, idx) => ({
        ticketTypeId: t.ticketTypeId || (qtyByTicketTypeId.size === 1 ? Array.from(qtyByTicketTypeId.keys())[0] : null),
        isPrimary: t.isPrimary !== undefined ? Boolean(t.isPrimary) : idx === 0,
        fullName: String(t.fullName || (idx === 0 ? clientName : `${clientName} (Participant #${idx + 1})`)).trim(),
        email: String(t.email || clientEmail).trim(),
        mobile: String(t.mobile || clientMobile).trim(),
        dob: t.dob ? String(t.dob) : null,
        gender: t.gender ? String(t.gender) : null,
        city: t.city ? String(t.city) : null,
        state: t.state ? String(t.state) : null,
        country: t.country ? String(t.country) : 'India',
      }));

      const primaryTicketTypeId = qtyByTicketTypeId.size === 1 ? Array.from(qtyByTicketTypeId.keys())[0] : null;

      // 4d. Create booking record inside transaction
      const newBooking = await tx.booking.create({
        data: {
          bookingRef,
          clientId,
          eventId,
          ticketTypeId: primaryTicketTypeId,
          seatCount: totalSeatCount,
          totalAmount,
          status: BookingStatus.INITIATED,
          commissionType: event.commission?.commissionType || null,
          platformValue: event.commission?.platformValue ? Number(event.commission.platformValue) : null,
          participants: {
            create: participantRecords,
          },
        },
        include: {
          participants: {
            include: { ticketType: true },
          },
          ticketType: true,
        },
      });

      return newBooking;
    });

    // Invalidate event search caches
    await this.cacheService.delPattern('events:search:*');

    // Create checkout order on payment gateway
    const razorpayOrder = await this.commsService.createRazorpayOrder(
      totalAmount,
      'INR',
      bookingRef
    );

    // Save razorpayOrderId into the booking
    let updatedBooking: any = booking;
    if (razorpayOrder && razorpayOrder.id) {
      updatedBooking = await this.bookingRepo.updatePaymentDetails(booking.id, {
        razorpayOrderId: razorpayOrder.id,
        paymentGateway: 'RAZORPAY',
      });
    }

    return {
      booking: updatedBooking,
      eventTitle: event.title,
      razorpayOrder,
    };
  }
}
