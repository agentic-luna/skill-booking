"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendGridEmailProvider = void 0;
const client_1 = require("@prisma/client");
const mail_1 = __importDefault(require("@sendgrid/mail"));
class SendGridEmailProvider {
    configRepo;
    cryptoService;
    logger;
    constructor(configRepo, cryptoService, logger) {
        this.configRepo = configRepo;
        this.cryptoService = cryptoService;
        this.logger = logger;
    }
    async sendEmail(to, subject, body) {
        const config = await this.configRepo.findIntegration(client_1.IntegrationService.SENDGRID);
        if (config && config.isActive) {
            try {
                const creds = this.cryptoService.decryptCredentials(config.credentials);
                const { apiKey, fromEmail, fromName } = creds || {};
                if (apiKey && fromEmail) {
                    mail_1.default.setApiKey(apiKey);
                    const response = await mail_1.default.send({
                        to,
                        from: {
                            email: fromEmail,
                            name: fromName || 'BookMyTraining Platform',
                        },
                        subject,
                        html: body,
                    });
                    const messageId = response[0]?.headers?.['x-message-id'] || `sg_${Math.random().toString(36).substring(2, 10)}`;
                    this.logger.info(`[SendGridEmailProvider] Real email sent to ${to} | Subject: ${subject} | MessageID: ${messageId}`);
                    return {
                        success: true,
                        messageId,
                    };
                }
            }
            catch (e) {
                this.logger.error('[SendGridEmailProvider] Error sending SendGrid email via official SDK', { error: e.response?.body || e.message || e });
                return { success: false };
            }
        }
        // Fallback to mock mode if config is inactive, missing or credentials incomplete
        this.logger.warn(`[Mock SendGrid] Active credentials not found. Mock EMAIL sent to: ${to} | Subject: ${subject}`);
        return {
            success: true,
            messageId: `mock_sg_${Math.random().toString(36).substring(2, 10)}`,
        };
    }
}
exports.SendGridEmailProvider = SendGridEmailProvider;
