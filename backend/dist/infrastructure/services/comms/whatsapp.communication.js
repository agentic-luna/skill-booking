"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsAppCommunicationService = void 0;
class WhatsAppCommunicationService {
    waProvider;
    constructor(waProvider) {
        this.waProvider = waProvider;
    }
    async sendWhatsAppMessage(to, message) {
        return this.waProvider.sendWhatsAppMessage(to, message);
    }
}
exports.WhatsAppCommunicationService = WhatsAppCommunicationService;
