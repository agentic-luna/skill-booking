"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TwilioSmsProvider = void 0;
const client_1 = require("@prisma/client");
class TwilioSmsProvider {
    configRepo;
    cryptoService;
    logger;
    constructor(configRepo, cryptoService, logger) {
        this.configRepo = configRepo;
        this.cryptoService = cryptoService;
        this.logger = logger;
    }
    async sendSms(to, message) {
        const config = await this.configRepo.findIntegration(client_1.IntegrationService.TWILIO);
        let accountSid = 'MOCK_TWILIO_SID';
        if (config && config.isActive) {
            try {
                const creds = this.cryptoService.decryptCredentials(config.credentials);
                accountSid = creds.accountSid || accountSid;
            }
            catch (e) {
                this.logger.warn('[TwilioSmsProvider] Decryption fallback to mock.', { error: e });
            }
        }
        this.logger.info(`[Mock Twilio] SMS sent to: ${to} | Body: ${message}`);
        return {
            success: true,
            messageId: `tw_${Math.random().toString(36).substring(2, 10)}`,
        };
    }
}
exports.TwilioSmsProvider = TwilioSmsProvider;
