"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetMyReviewForEventQueryHandler = exports.GetMyReviewForEventQuery = void 0;
class GetMyReviewForEventQuery {
    clientId;
    eventId;
    __tag = 'GetMyReviewForEventQuery';
    constructor(clientId, eventId) {
        this.clientId = clientId;
        this.eventId = eventId;
    }
}
exports.GetMyReviewForEventQuery = GetMyReviewForEventQuery;
class GetMyReviewForEventQueryHandler {
    reviewRepo;
    constructor(reviewRepo) {
        this.reviewRepo = reviewRepo;
    }
    async handle(query) {
        const { clientId, eventId } = query;
        const review = await this.reviewRepo.findUnique(clientId, eventId);
        return { review };
    }
}
exports.GetMyReviewForEventQueryHandler = GetMyReviewForEventQueryHandler;
