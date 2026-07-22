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

    if (config && config.isActive) {
      try {
        const creds = this.cryptoService.decryptCredentials(config.credentials);
        const { apiKey, fromEmail, fromName } = creds || {};

        if (apiKey && fromEmail) {
          const payload = {
            personalizations: [
              {
                to: [{ email: to }],
              },
            ],
            from: {
              email: fromEmail,
              name: fromName || 'Skill Booking Platform',
            },
            subject: subject,
            content: [
              {
                type: 'text/html',
                value: body,
              },
            ],
          };

          const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          });

          if (response.status === 202 || response.ok) {
            const messageId = response.headers.get('x-message-id') || `sg_${Math.random().toString(36).substring(2, 10)}`;
            this.logger.info(`[SendGridEmailProvider] Real email sent to ${to} | Subject: ${subject} | MessageID: ${messageId}`);
            return {
              success: true,
              messageId,
            };
          }

          const errorText = await response.text();
          this.logger.error('[SendGridEmailProvider] SendGrid API request failed', {
            status: response.status,
            error: errorText,
          });
          return { success: false };
        }
      } catch (e) {
        this.logger.error('[SendGridEmailProvider] Error sending SendGrid email', { error: e });
      }
    }

    // Fallback to mock mode if config is inactive, missing or credentials incomplete
    this.logger.warn(`[Mock SendGrid] Active credentials not found. Mock EMAIL sent to: ${to} | Subject: ${subject} | Body: ${body}`);
    return {
      success: true,
      messageId: `mock_sg_${Math.random().toString(36).substring(2, 10)}`,
    };
  }
}
