"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhooksController = void 0;
const di_container_1 = require("../di-container");
const handle_payment_webhook_1 = require("../../application/use-cases/webhooks/handle-payment-webhook");
const api_response_1 = require("../common/api-response");
class WebhooksController {
    /**
     * POST /api/v1/webhooks/razorpay
     *
     * Handles inbound Razorpay webhook events.
     * Verifies the `x-razorpay-signature` header before processing to prevent
     * spoofed webhook payloads. Returns 202 on processing errors so Razorpay
     * does not retry indefinitely on non-signature issues.
     */
    static async handleRazorpayWebhook(req, res, next) {
        try {
            console.log('[Webhook] Incoming Razorpay Webhook Request received.');
            console.log('[Webhook] Headers:', JSON.stringify(req.headers, null, 2));
            console.log('[Webhook] Body:', JSON.stringify(req.body, null, 2));
            // --- Signature Verification ---
            const signature = req.headers['x-razorpay-signature'];
            if (!signature) {
                di_container_1.logger.warn('[Webhook] Missing x-razorpay-signature header — rejecting request');
                console.warn('[Webhook] Missing x-razorpay-signature header');
                return res.status(401).json({
                    success: false,
                    error: { message: 'Missing webhook signature header.' },
                });
            }
            // Use the raw body for signature verification if captured, otherwise fall back to
            // serialising the parsed body (Razorpay sends compact JSON so this is equivalent).
            const rawBody = Buffer.isBuffer(req.rawBody)
                ? req.rawBody.toString("utf8")
                : JSON.stringify(req.body);
            console.log("Raw body is buffer:", Buffer.isBuffer(req.rawBody));
            console.log("Raw body length:", rawBody.length);
            console.log("typeof rawBody:", typeof rawBody);
            console.log("Is rawBody Buffer:", Buffer.isBuffer(req.rawBody));
            console.log("Raw Body Preview:", rawBody.substring(0, 200));
            const isValidSignature = await di_container_1.paymentGatewayProvider.verifyWebhookSignature(rawBody, signature);
            if (!isValidSignature) {
                di_container_1.logger.warn('[Webhook] Invalid Razorpay signature — request rejected', {
                    event: req.body?.event,
                    ip: req.ip,
                });
                console.warn('[Webhook] Invalid Razorpay signature');
                return res.status(401).json({
                    success: false,
                    error: { message: 'Webhook signature verification failed.' },
                });
            }
            // --- Process Event ---
            di_container_1.logger.info('[Webhook] Received verified Razorpay event: ' + req.body?.event);
            console.log('[Webhook] Razorpay Webhook Signature Verified Successfully. Event:', req.body?.event);
            const result = await di_container_1.mediator.send(new handle_payment_webhook_1.HandlePaymentWebhookCommand(req.body));
            return api_response_1.ApiResponse.success(res, result);
        }
        catch (error) {
            // Return 202 so Razorpay stops retrying — the event was received but failed internally.
            di_container_1.logger.error('[Webhook] Failed to process Razorpay event: ' + error.message, {
                event: req.body?.event,
            });
            return res.status(202).json({
                success: false,
                error: { message: error.message || 'Webhook processing failed' },
            });
        }
    }
}
exports.WebhooksController = WebhooksController;
