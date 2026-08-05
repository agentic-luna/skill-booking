"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckoutCommandHandler = exports.CheckoutCommand = void 0;
const client_1 = require("@prisma/client");
const errors_1 = require("../../common/errors");
class CheckoutCommand {
    clientId;
    eventId;
    seatCount;
    customAmount;
    participants;
    __tag = 'CheckoutCommand';
    constructor(clientId, eventId, seatCount, customAmount, participants) {
        this.clientId = clientId;
        this.eventId = eventId;
        this.seatCount = seatCount;
        this.customAmount = customAmount;
        this.participants = participants;
    }
}
exports.CheckoutCommand = CheckoutCommand;
class CheckoutCommandHandler {
    eventRepo;
    bookingRepo;
    cacheService;
    commsService;
    constructor(eventRepo, bookingRepo, cacheService, commsService) {
        this.eventRepo = eventRepo;
        this.bookingRepo = bookingRepo;
        this.cacheService = cacheService;
        this.commsService = commsService;
    }
    async handle(command) {
        const { clientId, eventId, seatCount, customAmount, participants } = command;
        if (seatCount <= 0) {
            throw new errors_1.BadRequestError('Seat count must be greater than zero.');
        }
        const event = await this.eventRepo.findById(eventId);
        if (!event) {
            throw new errors_1.NotFoundError('Event not found');
        }
        if (event.status !== client_1.EventStatus.APPROVED) {
            throw new errors_1.BadRequestError('Event booking is not open');
        }
        if (event.startTime && event.startTime < new Date()) {
            throw new errors_1.BadRequestError('This event has already started/finished and cannot be booked.');
        }
        if (event.availableSeats < seatCount) {
            throw new errors_1.BadRequestError(`Insufficient seats available. Only ${event.availableSeats} seats remaining.`);
        }
        // Decrement seats using optimistic locking
        const success = await this.eventRepo.decrementSeats(eventId, seatCount, event.version);
        if (!success) {
            throw new errors_1.ConflictError('Booking failed due to temporary ticket race conditions. Please retry.');
        }
        const ticketPrice = event.price;
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
            status: client_1.BookingStatus.INITIATED,
            commissionType: event.commission?.commissionType || null,
            platformValue: event.commission?.platformValue ? Number(event.commission.platformValue) : null,
            participants: participants || [],
        });
        // Invalidate event search caches
        await this.cacheService.delPattern('events:search:*');
        // Create checkout order on payment gateway
        const razorpayOrder = await this.commsService.createRazorpayOrder(totalAmount, 'INR', bookingRef);
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
exports.CheckoutCommandHandler = CheckoutCommandHandler;
