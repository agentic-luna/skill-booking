import { IRequest, IRequestHandler } from '../../common/mediator';
import { IConfigRepository } from '../../../domain/repositories/config.repository';
import { ICryptoService } from '../../services/crypto.service';
import { ILoggerService } from '../../services/logger.service';
import { WhatsAppConfig } from '../../../config/whatsapp.config';
import { IntegrationService } from '@prisma/client';
import { WhatsAppWebhookVerificationQuery } from '../../dtos/whatsapp-webhook.dto';

export class VerifyWhatsAppWebhookQuery implements IRequest<{ isValid: boolean; challenge?: string }> {
  readonly __tag = 'VerifyWhatsAppWebhookQuery';
  constructor(public readonly query: WhatsAppWebhookVerificationQuery) {}
}

export class VerifyWhatsAppWebhookQueryHandler
  implements IRequestHandler<VerifyWhatsAppWebhookQuery, { isValid: boolean; challenge?: string }>
{
  constructor(
    private configRepo?: IConfigRepository,
    private cryptoService?: ICryptoService,
    private logger?: ILoggerService
  ) {}

  async handle(request: VerifyWhatsAppWebhookQuery): Promise<{ isValid: boolean; challenge?: string }> {
    const { query } = request;
    const mode = query['hub.mode'];
    const token = query['hub.verify_token'];
    const challenge = query['hub.challenge'];

    // 1. Primary verification against environment configuration
    const envConfig = WhatsAppConfig.getConfig();
    let expectedVerifyToken = envConfig.verifyToken;

    // 2. Fallback: check if DB integration config contains custom verifyToken
    if (this.configRepo && this.cryptoService) {
      try {
        const dbIntegration = await this.configRepo.findIntegration(IntegrationService.META_WA);
        if (dbIntegration && dbIntegration.isActive && dbIntegration.credentials) {
          const creds = this.cryptoService.decryptCredentials(dbIntegration.credentials);
          if (creds && creds.verifyToken) {
            expectedVerifyToken = creds.verifyToken;
          }
        }
      } catch (err: any) {
        if (this.logger) {
          this.logger.warn('[WhatsApp Verification] Failed to read DB config, falling back to ENV verify token', {
            error: err.message || err,
          });
        }
      }
    }

    // 3. Meta Official Verification Flow logic
    if (mode === 'subscribe' && token && token === expectedVerifyToken) {
      if (this.logger) {
        this.logger.info('[WhatsApp Webhook] Meta Webhook verified successfully.');
      }
      return {
        isValid: true,
        challenge: challenge || '',
      };
    }

    if (this.logger) {
      this.logger.warn('[WhatsApp Webhook] Meta Webhook verification failed. Token mismatch.', {
        receivedToken: token,
        mode,
      });
    }

    return {
      isValid: false,
    };
  }
}
