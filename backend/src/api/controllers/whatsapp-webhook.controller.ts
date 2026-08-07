import { Request, Response, NextFunction } from 'express';
import { mediator } from '../di-container';
import { VerifyWhatsAppWebhookQuery } from '../../application/use-cases/webhooks/verify-whatsapp-webhook';
import { HandleWhatsAppWebhookCommand } from '../../application/use-cases/webhooks/handle-whatsapp-webhook';
import { WhatsAppWebhookVerificationQuery } from '../../application/dtos/whatsapp-webhook.dto';

export class WhatsAppWebhookController {
  /**
   * GET /api/v1/webhooks/whatsapp
   * Webhook verification endpoint required by Meta WhatsApp Cloud API.
   * Reference: https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/components#verification-requests
   */
  static async verifyWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query as unknown as WhatsAppWebhookVerificationQuery;
      const result = (await mediator.send(new VerifyWhatsAppWebhookQuery(query))) as any;

      if (result.isValid) {
        // Meta requires raw text response containing the hub.challenge value with HTTP 200
        return res.status(200).send(result.challenge);
      }

      return res.status(403).send('Verification token mismatch');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/webhooks/whatsapp
   * Incoming webhook events listener for Meta WhatsApp Cloud API.
   * Parses message status events (sent, delivered, read, failed) and incoming messages.
   * Reference: https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/payloads
   */
  static async handleWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      // Acknowledge receipt to Meta immediately with 200 OK
      const result = (await mediator.send(new HandleWhatsAppWebhookCommand(req.body))) as any;
      
      return res.status(200).json({
        success: true,
        message: 'EVENT_RECEIVED',
        processedEvents: result.processedEvents,
      });
    } catch (error) {
      // For Meta Webhooks, always return 200 OK to prevent Meta from disabling the webhook endpoint on transient server errors
      return res.status(200).json({
        success: false,
        message: 'EVENT_RECEIVED_WITH_ERROR',
      });
    }
  }
}
