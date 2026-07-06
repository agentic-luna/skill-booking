"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetEventReviewsQueryHandler = exports.GetEventReviewsQuery = void 0;
class GetEventReviewsQuery {
    eventId;
    __tag = 'GetEventReviewsQuery';
    constructor(eventId) {
        this.eventId = eventId;
    }
}
exports.GetEventReviewsQuery = GetEventReviewsQuery;
class GetEventReviewsQueryHandler {
    reviewRepo;
    constructor(reviewRepo) {
        this.reviewRepo = reviewRepo;
    }
    async handle(query) {
        const { eventId } = query;
        const reviews = await this.reviewRepo.findByEventId(eventId);
        const stats = await this.reviewRepo.findAverageRatingForEvent(eventId);
        return {
            reviews,
            stats,
        };
    }
}
exports.GetEventReviewsQueryHandler = GetEventReviewsQueryHandler;
