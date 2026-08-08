"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const webhooks_controller_1 = require("../controllers/webhooks.controller");
const whatsapp_webhook_controller_1 = require("../controllers/whatsapp-webhook.controller");
const rate_limiter_1 = require("../middleware/rate-limiter");
const router = (0, express_1.Router)();
router.post('/razorpay', rate_limiter_1.webhookLimiter, webhooks_controller_1.WebhooksController.handleRazorpayWebhook);
// Meta WhatsApp Cloud API Webhooks
router.get('/whatsapp', whatsapp_webhook_controller_1.WhatsAppWebhookController.verifyWebhook);
router.post('/whatsapp', rate_limiter_1.webhookLimiter, whatsapp_webhook_controller_1.WhatsAppWebhookController.handleWebhook);
exports.default = router;
