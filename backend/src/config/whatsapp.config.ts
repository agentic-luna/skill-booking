import { env } from './environment';

export interface IWhatsAppConfig {
  verifyToken: string;
  accessToken: string;
  phoneNumberId: string;
  businessAccountId: string;
  apiVersion: string;
}

export class WhatsAppConfig {
  /**
   * Retrieves Meta WhatsApp Cloud API configuration from environment variables.
   */
  static getConfig(): IWhatsAppConfig {
    return {
      verifyToken: env.WHATSAPP_VERIFY_TOKEN,
      accessToken: env.WHATSAPP_ACCESS_TOKEN,
      phoneNumberId: env.WHATSAPP_PHONE_NUMBER_ID,
      businessAccountId: env.WHATSAPP_BUSINESS_ACCOUNT_ID,
      apiVersion: 'v20.0',
    };
  }
}
