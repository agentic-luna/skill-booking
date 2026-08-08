"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsAppConfig = void 0;
const environment_1 = require("./environment");
class WhatsAppConfig {
    /**
     * Retrieves Meta WhatsApp Cloud API configuration from environment variables.
     */
    static getConfig() {
        return {
            verifyToken: environment_1.env.WHATSAPP_VERIFY_TOKEN,
            accessToken: environment_1.env.WHATSAPP_ACCESS_TOKEN,
            phoneNumberId: environment_1.env.WHATSAPP_PHONE_NUMBER_ID,
            businessAccountId: environment_1.env.WHATSAPP_BUSINESS_ACCOUNT_ID,
            apiVersion: 'v20.0',
        };
    }
}
exports.WhatsAppConfig = WhatsAppConfig;
