import { Request, Response, NextFunction } from 'express';
import { mediator, logger } from '../di-container';
import { HandlePaymentWebhookCommand } from '../../application/use-cases/webhooks/handle-payment-webhook';
import { ApiResponse } from '../common/api-response';

export class WebhooksController {
  static async handleRazorpayWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      logger.info('[API Webhook] Received Razorpay Webhook Event: ' + req.body.event);
      const result = await mediator.send(new HandlePaymentWebhookCommand(req.body));
      return ApiResponse.success(res, result);
    } catch (error: any) {
      logger.error('[API Webhook] Failed to process Razorpay Webhook: ' + (error as Error).message);
      return res.status(202).json({
        success: false,
        error: { message: error.message || 'Webhook processing failed' },
      });
    }
  }
}
