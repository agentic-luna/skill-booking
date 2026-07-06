import { IntegrationService } from '@prisma/client';
import { IEmailProvider } from './email.provider';
import { IConfigRepository } from '../../../domain/repositories/config.repository';
import { ICryptoService } from '../../../application/services/crypto.service';
import { ILoggerService } from '../../../application/services/logger.service';

export class SendGridEmailProvider implements IEmailProvider {
  constructor(
    private configRepo: IConfigRepository,
    private cryptoService: ICryptoService,
    private logger: ILoggerService
  ) {}

  async sendEmail(to: string, subject: string, body: string): Promise<{ success: boolean; messageId?: string }> {
    const config = await this.configRepo.findIntegration(IntegrationService.SENDGRID);
    let apiKey = 'MOCK_SENDGRID_KEY';
    if (config && config.isActive) {
      try {
        const creds = this.cryptoService.decryptCredentials(config.credentials);
        apiKey = creds.apiKey || apiKey;
      } catch (e) {
        this.logger.warn('[SendGridProvider] Decryption fallback to mock.', { error: e });
      }
    }

    this.logger.info(`[Mock SendGrid] EMAIL sent to: ${to} | Subject: ${subject} | Body: ${body}`);
    return {
      success: true,
      messageId: `sg_${Math.random().toString(36).substring(2, 10)}`,
    };
  }
}
