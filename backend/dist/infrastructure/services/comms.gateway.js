"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommunicationGateway = void 0;
function getPlainTextMessage(body) {
    try {
        if (body.trim().startsWith('{')) {
            const parsed = JSON.parse(body);
            if (parsed && typeof parsed === 'object' && typeof parsed.text === 'string') {
                return parsed.text;
            }
        }
    }
    catch { }
    return body;
}
class CommunicationGateway {
    emailService;
    smsService;
    whatsappService;
    paymentGateway;
    constructor(emailService, smsService, whatsappService, paymentGateway) {
        this.emailService = emailService;
        this.smsService = smsService;
        this.whatsappService = whatsappService;
        this.paymentGateway = paymentGateway;
    }
    async sendEmail(to, subject, body) {
        const res = await this.emailService.sendEmail(to, subject, body);
        return res.success;
    }
    async sendSMS(to, body) {
        const plainText = getPlainTextMessage(body);
        const res = await this.smsService.sendSms(to, plainText);
        return res.success;
    }
    async sendWhatsApp(to, body) {
        const res = await this.whatsappService.sendWhatsAppMessage(to, body);
        return res.success;
    }
    async createRazorpayOrder(amount, currency, receipt) {
        return this.paymentGateway.createOrder(amount, currency, receipt);
    }
    async transferPayout(destinationBankDetail, amount) {
        return this.paymentGateway.transferPayout(destinationBankDetail, amount);
    }
}
exports.CommunicationGateway = CommunicationGateway;
