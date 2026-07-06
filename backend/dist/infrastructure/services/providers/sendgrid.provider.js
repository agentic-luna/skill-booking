"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendGridEmailProvider = void 0;
const client_1 = require("@prisma/client");
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
        let apiKey = 'MOCK_SENDGRID_KEY';
        if (config && config.isActive) {
            try {
                const creds = this.cryptoService.decryptCredentials(config.credentials);
                apiKey = creds.apiKey || apiKey;
            }
            catch (e) {
                this.logger.warn('[SendGridProvider] Decryption fallback to mock.', { error: e });
            }
        }
        this.logger.info(`[Mock SendGrid] EMAIL sent to: ${to} | Subject: ${subject} | Body: ${body}`);
        return {
            success: true,
            messageId: `sg_${Math.random().toString(36).substring(2, 10)}`,
        };
    }
}
exports.SendGridEmailProvider = SendGridEmailProvider;
