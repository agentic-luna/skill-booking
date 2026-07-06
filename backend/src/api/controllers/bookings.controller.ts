import { Response, NextFunction } from 'express';
import { mediator } from '../di-container';
import { CheckoutCommand } from '../../application/use-cases/bookings/checkout';
import { CancelBookingCommand } from '../../application/use-cases/bookings/cancel-booking';
import { AuthenticatedRequest } from '../middleware/auth';
import { ApiResponse } from '../common/api-response';

export class BookingsController {
  static async checkout(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { eventId, seatCount, customAmount } = req.body;
      const result = await mediator.send(new CheckoutCommand(
        req.user!.id,
        eventId,
        Number(seatCount),
        customAmount ? Number(customAmount) : undefined
      ));
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  static async cancel(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { bookingId } = req.params;
      const cancellation = await mediator.send(new CancelBookingCommand(
        bookingId,
        req.user!.id,
        req.user!.role
      ));
      return ApiResponse.success(res, cancellation);
    } catch (error) {
      next(error);
    }
  }
}
