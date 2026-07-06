"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetaWhatsAppProvider = void 0;
const client_1 = require("@prisma/client");
class MetaWhatsAppProvider {
    configRepo;
    cryptoService;
    logger;
    constructor(configRepo, cryptoService, logger) {
        this.configRepo = configRepo;
        this.cryptoService = cryptoService;
        this.logger = logger;
    }
    async sendWhatsAppMessage(to, message) {
        const config = await this.configRepo.findIntegration(client_1.IntegrationService.META_WA);
        let token = 'MOCK_META_WA_TOKEN';
        if (config && config.isActive) {
            try {
                const creds = this.cryptoService.decryptCredentials(config.credentials);
                token = creds.accessToken || token;
            }
            catch (e) {
                this.logger.warn('[MetaWhatsAppProvider] Decryption fallback to mock.', { error: e });
            }
        }
        this.logger.info(`[Mock Meta WA] WhatsApp sent to: ${to} | Body: ${message}`);
        return {
            success: true,
            messageId: `wamid_${Math.random().toString(36).substring(2, 10)}`,
        };
    }
}
exports.MetaWhatsAppProvider = MetaWhatsAppProvider;
