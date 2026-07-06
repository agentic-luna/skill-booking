"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhooksController = void 0;
const di_container_1 = require("../di-container");
const handle_payment_webhook_1 = require("../../application/use-cases/webhooks/handle-payment-webhook");
const api_response_1 = require("../common/api-response");
class WebhooksController {
    static async handleRazorpayWebhook(req, res, next) {
        try {
            di_container_1.logger.info('[API Webhook] Received Razorpay Webhook Event: ' + req.body.event);
            const result = await di_container_1.mediator.send(new handle_payment_webhook_1.HandlePaymentWebhookCommand(req.body));
            return api_response_1.ApiResponse.success(res, result);
        }
        catch (error) {
            di_container_1.logger.error('[API Webhook] Failed to process Razorpay Webhook: ' + error.message);
            return res.status(202).json({
                success: false,
                error: { message: error.message || 'Webhook processing failed' },
            });
        }
    }
}
exports.WebhooksController = WebhooksController;
