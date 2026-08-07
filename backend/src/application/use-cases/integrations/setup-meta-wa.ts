import { IntegrationEnvironment, IntegrationService } from '@prisma/client';
import { IConfigRepository } from '../../../domain/repositories/config.repository';
import { ICryptoService } from '../../services/crypto.service';
import { ICacheService } from '../../services/cache.service';
import { IRequest, IRequestHandler } from '../../common/mediator';
import { BadRequestError } from '../../../api/common/errors';

export class SetupMetaWaCommand implements IRequest<any> {
  readonly __tag = 'SetupMetaWaCommand';
  constructor(
    public readonly environment: IntegrationEnvironment,
    public readonly accessToken: string,
    public readonly phoneNumberId: string,
    public readonly businessAccountId: string,
    public readonly isActive: boolean,
    public readonly updatedBy: string,
    public readonly verifyToken?: string
  ) {}
}

export class SetupMetaWaCommandHandler implements IRequestHandler<SetupMetaWaCommand, any> {
  constructor(
    private configRepo: IConfigRepository,
    private cryptoService: ICryptoService,
    private cacheService: ICacheService
  ) {}

  async handle(command: SetupMetaWaCommand): Promise<any> {
    const { environment, accessToken, phoneNumberId, businessAccountId, isActive, updatedBy, verifyToken } = command;
    
    if (!environment || !Object.values(IntegrationEnvironment).includes(environment)) {
      throw new BadRequestError('Invalid environment. Expected TEST or LIVE');
    }

    if (!accessToken || !phoneNumberId || !businessAccountId) {
        throw new BadRequestError('Missing required Meta WhatsApp credentials');
    }

    const credentials = {
        accessToken,
        phoneNumberId,
        businessAccountId,
        verifyToken: verifyToken || undefined,
    };

    const encrypted = this.cryptoService.encryptCredentials(credentials);

    const config = await this.configRepo.upsertIntegration(IntegrationService.META_WA, {
      environment,
      credentials: encrypted,
      isActive,
      updatedBy,
    });

    await this.cacheService.del(`configs:integrations:${IntegrationService.META_WA}`);

    return config;
  }
}
