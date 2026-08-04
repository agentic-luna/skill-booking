import { IntegrationService } from '@prisma/client';
import sgMail from '@sendgrid/mail';
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

    if (config && config.isActive) {
      try {
        const creds = this.cryptoService.decryptCredentials(config.credentials);
        const { apiKey, fromEmail, fromName } = creds || {};

        if (apiKey && fromEmail) {
          sgMail.setApiKey(apiKey);

          const response = await sgMail.send({
            to,
            from: {
              email: fromEmail,
              name: fromName || 'BookMyTraining Platform',
            },
            subject,
            html: body,
          });

          const messageId = response[0]?.headers?.['x-message-id'] || `sg_${Math.random().toString(36).substring(2, 10)}`;
          this.logger.info(`[SendGridEmailProvider] Real email sent to ${to} | Subject: ${subject} | MessageID: ${messageId}`);
          return {
            success: true,
            messageId,
          };
        }
      } catch (e: any) {
        this.logger.error('[SendGridEmailProvider] Error sending SendGrid email via official SDK', { error: e.response?.body || e.message || e });
        return { success: false };
      }
    }

    // Fallback to mock mode if config is inactive, missing or credentials incomplete
    this.logger.warn(`[Mock SendGrid] Active credentials not found. Mock EMAIL sent to: ${to} | Subject: ${subject}`);
    return {
      success: true,
      messageId: `mock_sg_${Math.random().toString(36).substring(2, 10)}`,
    };
  }
}
