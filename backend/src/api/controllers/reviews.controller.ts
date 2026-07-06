import { Request, Response, NextFunction } from 'express';
import { mediator } from '../di-container';
import { CreateEventReviewCommand } from '../../application/use-cases/reviews/create-review';
import { GetEventReviewsQuery } from '../../application/use-cases/reviews/get-reviews';
import { AuthenticatedRequest } from '../middleware/auth';
import { ApiResponse } from '../common/api-response';

export class ReviewsController {
  static async createReview(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { eventId, bookingId, rating, comment } = req.body;
      const result = await mediator.send(new CreateEventReviewCommand(req.user!.id, {
        eventId,
        bookingId,
        rating: Number(rating),
        comment,
      }));
      return ApiResponse.created(res, result);
    } catch (error) {
      next(error);
    }
  }

  static async getEventReviews(req: Request, res: Response, next: NextFunction) {
    try {
      const { eventId } = req.params;
      const result = await mediator.send(new GetEventReviewsQuery(eventId));
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }
}
