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
        const { accessToken, phoneNumberId } = creds || {};

        if (accessToken && phoneNumberId) {
          const payload = {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: to,
            type: 'text',
            text: {
              preview_url: false,
              body: message,
            },
          };

          const response = await fetch(`https://graph.facebook.com/v18.0/${phoneNumberId}/messages`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          });

          const data = await response.json() as any;

          if (response.ok && data?.messages?.[0]?.id) {
            const messageId = data.messages[0].id;
            this.logger.info(`[MetaWhatsAppProvider] Real WhatsApp message sent to ${to} | WAMID: ${messageId}`);
            return {
              success: true,
              messageId,
            };
          }

          this.logger.error('[MetaWhatsAppProvider] Meta WhatsApp API request failed', {
            status: response.status,
            error: data,
          });
          return { success: false };
        }
      } catch (e) {
        this.logger.error('[MetaWhatsAppProvider] Error sending Meta WhatsApp message', { error: e });
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
