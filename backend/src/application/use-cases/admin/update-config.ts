import { IntegrationService, IntegrationEnvironment } from '@prisma/client';
import { IConfigRepository } from '../../../domain/repositories/config.repository';
import { ICryptoService } from '../../services/crypto.service';
import { ICacheService } from '../../services/cache.service';
import { IRequest, IRequestHandler } from '../../common/mediator';

export class UpdateConfigCommand implements IRequest<any> {
  readonly __tag = 'UpdateConfigCommand';
  constructor(
    public readonly serviceName: IntegrationService,
    public readonly environment: IntegrationEnvironment,
    public readonly credentials: any,
    public readonly isActive: boolean,
    public readonly updatedBy: string
  ) {}
}

export class UpdateConfigCommandHandler implements IRequestHandler<UpdateConfigCommand, any> {
  constructor(
    private configRepo: IConfigRepository,
    private cryptoService: ICryptoService,
    private cacheService: ICacheService
  ) {}

  async handle(command: UpdateConfigCommand): Promise<any> {
    const { serviceName, environment, credentials, isActive, updatedBy } = command;
    const encrypted = this.cryptoService.encryptCredentials(credentials);

    const config = await this.configRepo.upsertIntegration(serviceName, {
      environment,
      credentials: encrypted,
      isActive,
      updatedBy,
    });

    // Invalidate Redis integration config cache
    await this.cacheService.del(`configs:integrations:${serviceName}`);

    return config;
  }
}
