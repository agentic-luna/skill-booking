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
    eventRepo;
    constructor(reviewRepo, eventRepo) {
        this.reviewRepo = reviewRepo;
        this.eventRepo = eventRepo;
    }
    async handle(query) {
        const { eventId } = query;
        const event = await this.eventRepo.findById(eventId);
        let reviews = [];
        let stats = { averageRating: 4.8, totalReviews: 0 };
        if (event) {
            const res = await this.reviewRepo.findByHostId(event.hostId, 1, 100);
            reviews = res.reviews;
            stats = await this.reviewRepo.findAverageRatingForHost(event.hostId);
        }
        else {
            reviews = await this.reviewRepo.findByEventId(eventId);
            stats = await this.reviewRepo.findAverageRatingForEvent(eventId);
        }
        return {
            reviews,
            stats: {
                averageRating: stats.averageRating,
                totalReviews: stats.totalReviews,
            },
        };
    }
}
exports.GetEventReviewsQueryHandler = GetEventReviewsQueryHandler;
