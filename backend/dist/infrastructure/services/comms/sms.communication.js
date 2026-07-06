"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmsCommunicationService = void 0;
class SmsCommunicationService {
    smsProvider;
    constructor(smsProvider) {
        this.smsProvider = smsProvider;
    }
    async sendSms(to, body) {
        return this.smsProvider.sendSms(to, body);
    }
}
exports.SmsCommunicationService = SmsCommunicationService;
