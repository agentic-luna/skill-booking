import { Request, Response, NextFunction } from 'express';
import { mediator } from '../di-container';
import { CreateEventReviewCommand } from '../../application/use-cases/reviews/create-review';
import { GetEventReviewsQuery } from '../../application/use-cases/reviews/get-reviews';
import { GetHostReviewsQuery } from '../../application/use-cases/reviews/get-host-reviews';
import { GetMyReviewForEventQuery } from '../../application/use-cases/reviews/get-my-review';
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

  static async getHostReviews(req: Request, res: Response, next: NextFunction) {
    try {
      const { hostId } = req.params;
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 5;
      const rating = req.query.rating ? Number(req.query.rating) : undefined;
      const result = await mediator.send(new GetHostReviewsQuery(hostId, page, limit, rating));
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  static async getMyReviewForEvent(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { eventId } = req.params;
      const result = await mediator.send(new GetMyReviewForEventQuery(req.user!.id, eventId));
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }
}
