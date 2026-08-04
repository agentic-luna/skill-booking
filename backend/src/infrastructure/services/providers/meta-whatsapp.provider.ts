import { IntegrationService } from '@prisma/client';
import { IWhatsAppProvider } from './whatsapp.provider';
import { IConfigRepository } from '../../../domain/repositories/config.repository';
import { ICryptoService } from '../../../application/services/crypto.service';
import { ILoggerService } from '../../../application/services/logger.service';

export class MetaWhatsAppProvider implements IWhatsAppProvider {
  constructor(
    private configRepo: IConfigRepository,
    private cryptoService: ICryptoService,
    private logger: ILoggerService
  ) {}

  async sendWhatsAppMessage(to: string, message: string): Promise<{ success: boolean; messageId?: string }> {
    const config = await this.configRepo.findIntegration(IntegrationService.META_WA);

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

          const data = (await response.json()) as any;

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
      } catch (e: any) {
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
