import { Router } from 'express';
import { WebhooksController } from '../controllers/webhooks.controller';
import { webhookLimiter } from '../middleware/rate-limiter';

const router = Router();

router.post('/razorpay', webhookLimiter, WebhooksController.handleRazorpayWebhook);

export default router;
