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
    __tag = 'CheckoutCommand';
    constructor(clientId, eventId, seatCount, customAmount) {
        this.clientId = clientId;
        this.eventId = eventId;
        this.seatCount = seatCount;
        this.customAmount = customAmount;
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
        const { clientId, eventId, seatCount, customAmount } = command;
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
        if (event.availableSeats < seatCount) {
            throw new errors_1.BadRequestError(`Insufficient seats available. Only ${event.availableSeats} seats remaining.`);
        }
        // Decrement seats using optimistic locking
        const success = await this.eventRepo.decrementSeats(eventId, seatCount, event.version);
        if (!success) {
            throw new errors_1.ConflictError('Booking failed due to temporary ticket race conditions. Please retry.');
        }
        const ticketPrice = event.price || 500;
        const totalAmount = customAmount || seatCount * ticketPrice;
        const bookingRef = `BK-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
        const booking = await this.bookingRepo.create({
            bookingRef,
            clientId,
            eventId,
            seatCount,
            totalAmount,
            status: client_1.BookingStatus.INITIATED,
        });
        // Invalidate event search caches
        await this.cacheService.delPattern('events:search:*');
        // Create checkout order on payment gateway
        const razorpayOrder = await this.commsService.createRazorpayOrder(totalAmount, 'INR', bookingRef);
        return {
            booking,
            eventTitle: event.title,
            razorpayOrder,
        };
    }
}
exports.CheckoutCommandHandler = CheckoutCommandHandler;
