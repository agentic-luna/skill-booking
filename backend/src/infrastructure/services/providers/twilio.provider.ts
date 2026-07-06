import { IntegrationService } from '@prisma/client';
import { ISmsProvider } from './sms.provider';
import { IConfigRepository } from '../../../domain/repositories/config.repository';
import { ICryptoService } from '../../../application/services/crypto.service';
import { ILoggerService } from '../../../application/services/logger.service';

export class TwilioSmsProvider implements ISmsProvider {
  constructor(
    private configRepo: IConfigRepository,
    private cryptoService: ICryptoService,
    private logger: ILoggerService
  ) {}

  async sendSms(to: string, message: string): Promise<{ success: boolean; messageId?: string }> {
    const config = await this.configRepo.findIntegration(IntegrationService.TWILIO);
    let accountSid = 'MOCK_TWILIO_SID';
    if (config && config.isActive) {
      try {
        const creds = this.cryptoService.decryptCredentials(config.credentials);
        accountSid = creds.accountSid || accountSid;
      } catch (e) {
        this.logger.warn('[TwilioSmsProvider] Decryption fallback to mock.', { error: e });
      }
    }

    this.logger.info(`[Mock Twilio] SMS sent to: ${to} | Body: ${message}`);
    return {
      success: true,
      messageId: `tw_${Math.random().toString(36).substring(2, 10)}`,
    };
  }
}
