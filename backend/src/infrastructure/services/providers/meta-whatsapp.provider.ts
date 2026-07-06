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
    let token = 'MOCK_META_WA_TOKEN';
    if (config && config.isActive) {
      try {
        const creds = this.cryptoService.decryptCredentials(config.credentials);
        token = creds.accessToken || token;
      } catch (e) {
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
