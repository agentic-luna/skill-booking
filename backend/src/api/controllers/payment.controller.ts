import { Request, Response, NextFunction } from 'express';
import { mediator } from '../di-container';
import { ApiResponse } from '../common/api-response';
import { GetRazorpayPublicKeyQuery } from '../../application/use-cases/payments/get-razorpay-public-key';

export class PaymentController {
    static async getRazorpayPublicKey(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            const result = await mediator.send(new GetRazorpayPublicKeyQuery());

            return ApiResponse.success(res, result);
        } catch (error) {
            next(error);
        }
    }
}