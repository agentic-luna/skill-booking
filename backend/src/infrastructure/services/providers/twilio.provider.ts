import { IntegrationService } from '@prisma/client';
import twilio from 'twilio';
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

    if (config && config.isActive) {
      try {
        const creds = this.cryptoService.decryptCredentials(config.credentials);
        const { accountSid, authToken, fromNumber } = creds || {};

        if (accountSid && authToken && fromNumber) {
          const client = twilio(accountSid, authToken);
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
      } catch (e: any) {
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
