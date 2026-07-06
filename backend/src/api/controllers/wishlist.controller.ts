import { Response, NextFunction } from 'express';
import { mediator } from '../di-container';
import { AuthenticatedRequest } from '../middleware/auth';
import { ApiResponse } from '../common/api-response';
import {
  AddToWishlistCommand,
  RemoveFromWishlistCommand,
  GetUserWishlistQuery,
} from '../../application/use-cases/wishlist/manage-wishlist';

export class WishlistController {
  static async addToWishlist(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { eventId } = req.body;
      const result = await mediator.send(new AddToWishlistCommand(req.user!.id, eventId));
      return ApiResponse.created(res, result);
    } catch (error) {
      next(error);
    }
  }

  static async removeFromWishlist(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { eventId } = req.params;
      const result = await mediator.send(new RemoveFromWishlistCommand(req.user!.id, eventId));
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  static async getWishlist(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await mediator.send(new GetUserWishlistQuery(req.user!.id));
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }
}
