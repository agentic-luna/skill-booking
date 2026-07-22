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
        if (config && config.isActive) {
            try {
                const creds = this.cryptoService.decryptCredentials(config.credentials);
                const { accountSid, authToken, fromNumber } = creds || {};
                if (accountSid && authToken && fromNumber) {
                    const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
                    const body = new URLSearchParams({
                        To: to,
                        From: fromNumber,
                        Body: message,
                    });
                    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Basic ${auth}`,
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                        body: body.toString(),
                    });
                    const data = await response.json();
                    if (response.ok && data?.sid) {
                        this.logger.info(`[TwilioSmsProvider] Real SMS sent to ${to} | SID: ${data.sid}`);
                        return {
                            success: true,
                            messageId: data.sid,
                        };
                    }
                    this.logger.error('[TwilioSmsProvider] Twilio API request failed', {
                        status: response.status,
                        error: data,
                    });
                    return { success: false };
                }
            }
            catch (e) {
                this.logger.error('[TwilioSmsProvider] Error processing Twilio SMS send', { error: e });
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
