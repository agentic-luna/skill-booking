import { Request, Response, NextFunction } from 'express';
import { mediator, logger, paymentGatewayProvider } from '../di-container';
import { HandlePaymentWebhookCommand } from '../../application/use-cases/webhooks/handle-payment-webhook';
import { ApiResponse } from '../common/api-response';

export class WebhooksController {
  /**
   * POST /api/v1/webhooks/razorpay
   *
   * Handles inbound Razorpay webhook events.
   * Verifies the `x-razorpay-signature` header before processing to prevent
   * spoofed webhook payloads. Returns 202 on processing errors so Razorpay
   * does not retry indefinitely on non-signature issues.
   */
  static async handleRazorpayWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      // --- Signature Verification ---
      const signature = req.headers['x-razorpay-signature'] as string | undefined;

      if (!signature) {
        logger.warn('[Webhook] Missing x-razorpay-signature header — rejecting request');
        return res.status(401).json({
          success: false,
          error: { message: 'Missing webhook signature header.' },
        });
      }

      // Use the raw body for signature verification if captured, otherwise fall back to
      // serialising the parsed body (Razorpay sends compact JSON so this is equivalent).
      const rawBody: string =
        (req as any).rawBody ??
        (Buffer.isBuffer(req.body) ? req.body.toString('utf-8') : JSON.stringify(req.body));

      const isValidSignature = await paymentGatewayProvider.verifyWebhookSignature(
        rawBody,
        signature
      );

      if (!isValidSignature) {
        logger.warn('[Webhook] Invalid Razorpay signature — request rejected', {
          event: req.body?.event,
          ip: req.ip,
        });
        return res.status(401).json({
          success: false,
          error: { message: 'Webhook signature verification failed.' },
        });
      }

      // --- Process Event ---
      logger.info('[Webhook] Received verified Razorpay event: ' + req.body?.event);
      const result = await mediator.send(new HandlePaymentWebhookCommand(req.body));
      return ApiResponse.success(res, result);
    } catch (error: any) {
      // Return 202 so Razorpay stops retrying — the event was received but failed internally.
      logger.error('[Webhook] Failed to process Razorpay event: ' + (error as Error).message, {
        event: req.body?.event,
      });
      return res.status(202).json({
        success: false,
        error: { message: error.message || 'Webhook processing failed' },
      });
    }
  }
}
