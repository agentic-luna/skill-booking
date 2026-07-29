import { Request, Response, NextFunction } from 'express';
import { mediator } from '../di-container';
import { BoostEventCommand } from '../../application/use-cases/boosted-events/boost-event';
import { GetBoostedEventsQuery } from '../../application/use-cases/boosted-events/get-boosted-events';
import { RequestBoostCommand } from '../../application/use-cases/boosted-events/request-boost';
import { UpdateBoostStatusCommand } from '../../application/use-cases/boosted-events/update-boost-status';
import { GetBoostRequestsQuery } from '../../application/use-cases/boosted-events/get-boost-requests';
import { VerifyBoostPaymentCommand } from '../../application/use-cases/boosted-events/verify-boost-payment';
import { GetBoostPricingQuery } from '../../application/use-cases/boosted-events/get-boost-pricing';
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

  static async getPricing(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await mediator.send(new GetBoostPricingQuery());
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

  static async requestBoost(req: Request, res: Response, next: NextFunction) {
    try {
      const { eventId, durationDays } = req.body;
      const result = await mediator.send(new RequestBoostCommand(eventId, Number(durationDays)));
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  static async updateBoostStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const result = await mediator.send(new UpdateBoostStatusCommand(id, status));
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  static async verifyBoostPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const { boostId, razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;
      const result = await mediator.send(new VerifyBoostPaymentCommand(boostId, razorpayPaymentId, razorpayOrderId, razorpaySignature));
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  static async getBoostRequests(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await mediator.send(new GetBoostRequestsQuery());
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }
}
