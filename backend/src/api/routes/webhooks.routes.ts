import { Router } from 'express';
import { WebhooksController } from '../controllers/webhooks.controller';
import { WhatsAppWebhookController } from '../controllers/whatsapp-webhook.controller';
import { webhookLimiter } from '../middleware/rate-limiter';

const router = Router();

router.post('/razorpay', webhookLimiter, WebhooksController.handleRazorpayWebhook);

// Meta WhatsApp Cloud API Webhooks
router.get('/whatsapp', WhatsAppWebhookController.verifyWebhook);
router.post('/whatsapp', webhookLimiter, WhatsAppWebhookController.handleWebhook);

export default router;
