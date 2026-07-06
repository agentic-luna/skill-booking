"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationsController = void 0;
const di_container_1 = require("../di-container");
const api_response_1 = require("../common/api-response");
const setup_twilio_1 = require("../../application/use-cases/integrations/setup-twilio");
const setup_sendgrid_1 = require("../../application/use-cases/integrations/setup-sendgrid");
const setup_meta_wa_1 = require("../../application/use-cases/integrations/setup-meta-wa");
const setup_razorpay_1 = require("../../application/use-cases/integrations/setup-razorpay");
class IntegrationsController {
    static async setupTwilio(req, res, next) {
        try {
            const { environment, accountSid, authToken, fromNumber, isActive } = req.body;
            const result = await di_container_1.mediator.send(new setup_twilio_1.SetupTwilioCommand(environment, accountSid, authToken, fromNumber, isActive ?? true, req.user.id));
            return api_response_1.ApiResponse.success(res, result, 200, 'Twilio configuration updated');
        }
        catch (error) {
            next(error);
        }
    }
    static async setupSendgrid(req, res, next) {
        try {
            const { environment, apiKey, fromEmail, fromName, isActive } = req.body;
            const result = await di_container_1.mediator.send(new setup_sendgrid_1.SetupSendgridCommand(environment, apiKey, fromEmail, fromName, isActive ?? true, req.user.id));
            return api_response_1.ApiResponse.success(res, result, 200, 'SendGrid configuration updated');
        }
        catch (error) {
            next(error);
        }
    }
    static async setupMetaWa(req, res, next) {
        try {
            const { environment, accessToken, phoneNumberId, businessAccountId, isActive } = req.body;
            const result = await di_container_1.mediator.send(new setup_meta_wa_1.SetupMetaWaCommand(environment, accessToken, phoneNumberId, businessAccountId, isActive ?? true, req.user.id));
            return api_response_1.ApiResponse.success(res, result, 200, 'Meta WhatsApp configuration updated');
        }
        catch (error) {
            next(error);
        }
    }
    static async setupRazorpay(req, res, next) {
        try {
            const { environment, keyId, keySecret, webhookSecret, isActive } = req.body;
            const result = await di_container_1.mediator.send(new setup_razorpay_1.SetupRazorpayCommand(environment, keyId, keySecret, webhookSecret, isActive ?? true, req.user.id));
            return api_response_1.ApiResponse.success(res, result, 200, 'Razorpay configuration updated');
        }
        catch (error) {
            next(error);
        }
    }
}
exports.IntegrationsController = IntegrationsController;
