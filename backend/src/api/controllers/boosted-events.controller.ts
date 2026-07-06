import { Request, Response, NextFunction } from 'express';
import { mediator } from '../di-container';
import { BoostEventCommand } from '../../application/use-cases/boosted-events/boost-event';
import { GetBoostedEventsQuery } from '../../application/use-cases/boosted-events/get-boosted-events';
import { ApiResponse } from '../common/api-response';

export class BoostedEventsController {
  static async getActiveBoostedEvents(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await mediator.send(new GetBoostedEventsQuery());
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  static async boostEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const { eventId, priority, startDate, endDate, isActive } = req.body;
      const result = await mediator.send(new BoostEventCommand(
        eventId,
        Number(priority),
        startDate,
        endDate,
        isActive !== undefined ? isActive : true
      ));
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }
}
