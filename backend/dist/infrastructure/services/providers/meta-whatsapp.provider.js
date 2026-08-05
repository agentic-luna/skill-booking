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
        if (config && config.isActive) {
            try {
                const creds = this.cryptoService.decryptCredentials(config.credentials);
                const { accessToken, phoneNumberId, apiVersion } = creds || {};
                if (accessToken && phoneNumberId) {
                    // Normalize phone number to digits only (E.164 without leading plus)
                    const recipientPhone = to.replace(/[^\d]/g, '');
                    const version = apiVersion || 'v20.0';
                    const payload = {
                        messaging_product: 'whatsapp',
                        recipient_type: 'individual',
                        to: recipientPhone,
                        type: 'text',
                        text: {
                            preview_url: false,
                            body: message,
                        },
                    };
                    const url = `https://graph.facebook.com/${version}/${phoneNumberId}/messages`;
                    const response = await fetch(url, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${accessToken}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(payload),
                    });
                    const data = (await response.json());
                    if (response.ok && data?.messages?.[0]?.id) {
                        const messageId = data.messages[0].id;
                        this.logger.info(`[MetaWhatsAppProvider] Real WhatsApp message sent to ${recipientPhone} via Meta Graph API ${version} | WAMID: ${messageId}`);
                        return {
                            success: true,
                            messageId,
                        };
                    }
                    this.logger.error('[MetaWhatsAppProvider] Meta WhatsApp Graph API request failed', {
                        status: response.status,
                        error: data?.error?.message || data?.error?.error_user_msg || data,
                    });
                    return { success: false };
                }
            }
            catch (e) {
                this.logger.error('[MetaWhatsAppProvider] Error sending Meta WhatsApp message', { error: e.message || e });
            }
        }
        // Fallback to mock mode if config is inactive, missing or credentials incomplete
        this.logger.warn(`[Mock Meta WA] Active credentials not found. Mock WhatsApp sent to: ${to} | Body: ${message}`);
        return {
            success: true,
            messageId: `mock_wamid_${Math.random().toString(36).substring(2, 10)}`,
        };
    }
}
exports.MetaWhatsAppProvider = MetaWhatsAppProvider;
