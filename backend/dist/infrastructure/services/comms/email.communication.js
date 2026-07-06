"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailCommunicationService = void 0;
class EmailCommunicationService {
    emailProvider;
    constructor(emailProvider) {
        this.emailProvider = emailProvider;
    }
    async sendEmail(to, subject, body) {
        return this.emailProvider.sendEmail(to, subject, body);
    }
}
exports.EmailCommunicationService = EmailCommunicationService;
