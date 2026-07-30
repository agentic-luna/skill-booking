"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetHostReviewsQueryHandler = exports.GetHostReviewsQuery = void 0;
class GetHostReviewsQuery {
    hostId;
    page;
    limit;
    __tag = 'GetHostReviewsQuery';
    constructor(hostId, page = 1, limit = 5) {
        this.hostId = hostId;
        this.page = page;
        this.limit = limit;
    }
}
exports.GetHostReviewsQuery = GetHostReviewsQuery;
class GetHostReviewsQueryHandler {
    reviewRepo;
    constructor(reviewRepo) {
        this.reviewRepo = reviewRepo;
    }
    async handle(query) {
        const { hostId, page, limit } = query;
        const result = await this.reviewRepo.findByHostId(hostId, page, limit);
        const stats = await this.reviewRepo.findAverageRatingForHost(hostId);
        return {
            reviews: result.reviews,
            total: result.total,
            stats: {
                averageRating: stats.averageRating,
                totalReviews: stats.totalReviews,
            },
        };
    }
}
exports.GetHostReviewsQueryHandler = GetHostReviewsQueryHandler;
