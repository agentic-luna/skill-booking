import { EventStatus, BookingStatus } from '@prisma/client';
import { IEventRepository } from '../../../domain/repositories/event.repository';
import { IBookingRepository } from '../../../domain/repositories/booking.repository';
import { ICacheService } from '../../services/cache.service';
import { ICommunicationService } from '../../services/communication.service';
import { BadRequestError, NotFoundError, ConflictError } from '../../common/errors';
import { IRequest, IRequestHandler } from '../../common/mediator';

export class CheckoutCommand implements IRequest<any> {
  readonly __tag = 'CheckoutCommand';
  constructor(
    public readonly clientId: string,
    public readonly eventId: string,
    public readonly seatCount: number,
    public readonly customAmount?: number,
    public readonly participants?: any[]
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
    const { clientId, eventId, seatCount, customAmount, participants } = command;

    if (seatCount <= 0) {
      throw new BadRequestError('Seat count must be greater than zero.');
    }

    const event = await this.eventRepo.findById(eventId);
    if (!event) {
      throw new NotFoundError('Event not found');
    }

    if (event.status !== EventStatus.APPROVED) {
      throw new BadRequestError('Event booking is not open');
    }

    if (event.startTime && event.startTime < new Date()) {
      throw new BadRequestError('This event has already started/finished and cannot be booked.');
    }

    if (event.availableSeats < seatCount) {
      throw new BadRequestError(`Insufficient seats available. Only ${event.availableSeats} seats remaining.`);
    }

    // Decrement seats using optimistic locking
    const success = await this.eventRepo.decrementSeats(eventId, seatCount, event.version);
    if (!success) {
      throw new ConflictError('Booking failed due to temporary ticket race conditions. Please retry.');
    }

    const ticketPrice = event.price ;
    let baseAmount = customAmount || seatCount * ticketPrice;
    
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

    const booking = await this.bookingRepo.create({
      bookingRef,
      clientId,
      eventId,
      seatCount,
      totalAmount,
      status: BookingStatus.INITIATED,
      commissionType: event.commission?.commissionType || null,
      platformValue: event.commission?.platformValue ? Number(event.commission.platformValue) : null,
      participants: participants || [],
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
    let updatedBooking = booking;
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
