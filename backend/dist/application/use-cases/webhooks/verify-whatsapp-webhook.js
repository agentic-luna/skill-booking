"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerifyWhatsAppWebhookQueryHandler = exports.VerifyWhatsAppWebhookQuery = void 0;
const whatsapp_config_1 = require("../../../config/whatsapp.config");
const client_1 = require("@prisma/client");
class VerifyWhatsAppWebhookQuery {
    query;
    __tag = 'VerifyWhatsAppWebhookQuery';
    constructor(query) {
        this.query = query;
    }
}
exports.VerifyWhatsAppWebhookQuery = VerifyWhatsAppWebhookQuery;
class VerifyWhatsAppWebhookQueryHandler {
    configRepo;
    cryptoService;
    logger;
    constructor(configRepo, cryptoService, logger) {
        this.configRepo = configRepo;
        this.cryptoService = cryptoService;
        this.logger = logger;
    }
    async handle(request) {
        const { query } = request;
        const mode = query['hub.mode'];
        const token = query['hub.verify_token'];
        const challenge = query['hub.challenge'];
        // 1. Primary verification against environment configuration
        const envConfig = whatsapp_config_1.WhatsAppConfig.getConfig();
        let expectedVerifyToken = envConfig.verifyToken;
        // 2. Fallback: check if DB integration config contains custom verifyToken
        if (this.configRepo && this.cryptoService) {
            try {
                const dbIntegration = await this.configRepo.findIntegration(client_1.IntegrationService.META_WA);
                if (dbIntegration && dbIntegration.isActive && dbIntegration.credentials) {
                    const creds = this.cryptoService.decryptCredentials(dbIntegration.credentials);
                    if (creds && creds.verifyToken) {
                        expectedVerifyToken = creds.verifyToken;
                    }
                }
            }
            catch (err) {
                if (this.logger) {
                    this.logger.warn('[WhatsApp Verification] Failed to read DB config, falling back to ENV verify token', {
                        error: err.message || err,
                    });
                }
            }
        }
        // 3. Meta Official Verification Flow logic
        if (mode === 'subscribe' && token && token === expectedVerifyToken) {
            if (this.logger) {
                this.logger.info('[WhatsApp Webhook] Meta Webhook verified successfully.');
            }
            return {
                isValid: true,
                challenge: challenge || '',
            };
        }
        if (this.logger) {
            this.logger.warn('[WhatsApp Webhook] Meta Webhook verification failed. Token mismatch.', {
                receivedToken: token,
                mode,
            });
        }
        return {
            isValid: false,
        };
    }
}
exports.VerifyWhatsAppWebhookQueryHandler = VerifyWhatsAppWebhookQueryHandler;
