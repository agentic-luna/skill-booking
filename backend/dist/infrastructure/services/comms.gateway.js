"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommunicationGateway = void 0;
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
        const res = await this.smsService.sendSms(to, body);
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
