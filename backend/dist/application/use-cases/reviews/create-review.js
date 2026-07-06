"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateEventReviewCommandHandler = exports.CreateEventReviewCommand = void 0;
const errors_1 = require("../../common/errors");
class CreateEventReviewCommand {
    clientId;
    data;
    __tag = 'CreateEventReviewCommand';
    constructor(clientId, data) {
        this.clientId = clientId;
        this.data = data;
    }
}
exports.CreateEventReviewCommand = CreateEventReviewCommand;
class CreateEventReviewCommandHandler {
    reviewRepo;
    bookingRepo;
    eventRepo;
    userRepo;
    constructor(reviewRepo, bookingRepo, eventRepo, userRepo) {
        this.reviewRepo = reviewRepo;
        this.bookingRepo = bookingRepo;
        this.eventRepo = eventRepo;
        this.userRepo = userRepo;
    }
    async handle(command) {
        const { clientId, data } = command;
        if (data.rating < 1 || data.rating > 5) {
            throw new errors_1.BadRequestError('Rating must be an integer or decimal between 1 and 5.');
        }
        const event = await this.eventRepo.findById(data.eventId);
        if (!event) {
            throw new errors_1.NotFoundError('Event not found');
        }
        // Verify client has a confirmed booking for this event
        const bookings = await this.bookingRepo.findMany({
            clientId,
            eventId: data.eventId,
            status: 'CONFIRMED',
        });
        if (bookings.length === 0) {
            throw new errors_1.ForbiddenError('Only attended clients with a confirmed booking can review this event.');
        }
        const review = await this.reviewRepo.create({
            eventId: data.eventId,
            bookingId: data.bookingId || bookings[0].id,
            clientId,
            rating: Number(data.rating),
            comment: data.comment || null,
        });
        // Recalculate event average rating
        const eventStats = await this.reviewRepo.findAverageRatingForEvent(data.eventId);
        // Recalculate host overall average rating
        const hostStats = await this.reviewRepo.findAverageRatingForHost(event.hostId);
        return {
            review,
            eventRating: eventStats,
            hostRating: hostStats,
        };
    }
}
exports.CreateEventReviewCommandHandler = CreateEventReviewCommandHandler;
