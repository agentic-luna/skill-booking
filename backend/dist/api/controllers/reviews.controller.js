"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewsController = void 0;
const di_container_1 = require("../di-container");
const create_review_1 = require("../../application/use-cases/reviews/create-review");
const get_reviews_1 = require("../../application/use-cases/reviews/get-reviews");
const api_response_1 = require("../common/api-response");
class ReviewsController {
    static async createReview(req, res, next) {
        try {
            const { eventId, bookingId, rating, comment } = req.body;
            const result = await di_container_1.mediator.send(new create_review_1.CreateEventReviewCommand(req.user.id, {
                eventId,
                bookingId,
                rating: Number(rating),
                comment,
            }));
            return api_response_1.ApiResponse.created(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    static async getEventReviews(req, res, next) {
        try {
            const { eventId } = req.params;
            const result = await di_container_1.mediator.send(new get_reviews_1.GetEventReviewsQuery(eventId));
            return api_response_1.ApiResponse.success(res, result);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.ReviewsController = ReviewsController;
