"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsAppWebhookController = void 0;
const di_container_1 = require("../di-container");
const verify_whatsapp_webhook_1 = require("../../application/use-cases/webhooks/verify-whatsapp-webhook");
const handle_whatsapp_webhook_1 = require("../../application/use-cases/webhooks/handle-whatsapp-webhook");
class WhatsAppWebhookController {
    /**
     * GET /api/v1/webhooks/whatsapp
     * Webhook verification endpoint required by Meta WhatsApp Cloud API.
     * Reference: https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/components#verification-requests
     */
    static async verifyWebhook(req, res, next) {
        try {
            const query = req.query;
            const result = (await di_container_1.mediator.send(new verify_whatsapp_webhook_1.VerifyWhatsAppWebhookQuery(query)));
            if (result.isValid) {
                // Meta requires raw text response containing the hub.challenge value with HTTP 200
                return res.status(200).send(result.challenge);
            }
            return res.status(403).send('Verification token mismatch');
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * POST /api/v1/webhooks/whatsapp
     * Incoming webhook events listener for Meta WhatsApp Cloud API.
     * Parses message status events (sent, delivered, read, failed) and incoming messages.
     * Reference: https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/payloads
     */
    static async handleWebhook(req, res, next) {
        try {
            // Acknowledge receipt to Meta immediately with 200 OK
            const result = (await di_container_1.mediator.send(new handle_whatsapp_webhook_1.HandleWhatsAppWebhookCommand(req.body)));
            return res.status(200).json({
                success: true,
                message: 'EVENT_RECEIVED',
                processedEvents: result.processedEvents,
            });
        }
        catch (error) {
            // For Meta Webhooks, always return 200 OK to prevent Meta from disabling the webhook endpoint on transient server errors
            return res.status(200).json({
                success: false,
                message: 'EVENT_RECEIVED_WITH_ERROR',
            });
        }
    }
}
exports.WhatsAppWebhookController = WhatsAppWebhookController;
