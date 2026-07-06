import { IntegrationEnvironment, IntegrationService } from '@prisma/client';
import { IConfigRepository } from '../../../domain/repositories/config.repository';
import { ICryptoService } from '../../services/crypto.service';
import { ICacheService } from '../../services/cache.service';
import { IRequest, IRequestHandler } from '../../common/mediator';
import { BadRequestError } from '../../../api/common/errors';

export class SetupSendgridCommand implements IRequest<any> {
  readonly __tag = 'SetupSendgridCommand';
  constructor(
    public readonly environment: IntegrationEnvironment,
    public readonly apiKey: string,
    public readonly fromEmail: string,
    public readonly fromName: string,
    public readonly isActive: boolean,
    public readonly updatedBy: string
  ) {}
}

export class SetupSendgridCommandHandler implements IRequestHandler<SetupSendgridCommand, any> {
  constructor(
    private configRepo: IConfigRepository,
    private cryptoService: ICryptoService,
    private cacheService: ICacheService
  ) {}

  async handle(command: SetupSendgridCommand): Promise<any> {
    const { environment, apiKey, fromEmail, fromName, isActive, updatedBy } = command;
    
    if (!apiKey || !fromEmail || !fromName) {
        throw new BadRequestError('Missing required SendGrid credentials');
    }

    const credentials = {
        apiKey,
        fromEmail,
        fromName
    };

    const encrypted = this.cryptoService.encryptCredentials(credentials);

    const config = await this.configRepo.upsertIntegration(IntegrationService.SENDGRID, {
      environment,
      credentials: encrypted,
      isActive,
      updatedBy,
    });

    await this.cacheService.del(`configs:integrations:${IntegrationService.SENDGRID}`);

    return config;
  }
}
