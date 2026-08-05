"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TwilioSmsProvider = void 0;
const client_1 = require("@prisma/client");
const twilio_1 = __importDefault(require("twilio"));
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
        if (config && config.isActive) {
            try {
                const creds = this.cryptoService.decryptCredentials(config.credentials);
                const { accountSid, authToken, fromNumber } = creds || {};
                if (accountSid && authToken && fromNumber) {
                    const client = (0, twilio_1.default)(accountSid, authToken);
                    const result = await client.messages.create({
                        to,
                        from: fromNumber,
                        body: message,
                    });
                    if (result && result.sid) {
                        this.logger.info(`[TwilioSmsProvider] Real SMS sent via official SDK to ${to} | SID: ${result.sid}`);
                        return {
                            success: true,
                            messageId: result.sid,
                        };
                    }
                }
            }
            catch (e) {
                this.logger.error('[TwilioSmsProvider] Error processing Twilio SMS send via official SDK', { error: e.message || e });
                return { success: false };
            }
        }
        // Fallback to mock mode if config is inactive, missing or credentials incomplete
        this.logger.warn(`[Mock Twilio] Active credentials not found. Mock SMS sent to: ${to} | Body: ${message}`);
        return {
            success: true,
            messageId: `mock_tw_${Math.random().toString(36).substring(2, 10)}`,
        };
    }
}
exports.TwilioSmsProvider = TwilioSmsProvider;
