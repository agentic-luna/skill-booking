import { IntegrationService, IntegrationEnvironment } from '@prisma/client';
import { IConfigRepository } from '../../../domain/repositories/config.repository';
import { ICryptoService } from '../../services/crypto.service';
import { ICacheService } from '../../services/cache.service';
import { IRequest, IRequestHandler } from '../../common/mediator';
import { BadRequestError } from '../../../api/common/errors';

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
    
    if (environment && !Object.values(IntegrationEnvironment).includes(environment)) {
      throw new BadRequestError('Invalid environment. Expected TEST or LIVE');
    }

    const existing = await this.configRepo.findIntegration(serviceName);

    const updatedEnv = environment || existing?.environment || IntegrationEnvironment.TEST;
    const updatedIsActive = isActive !== undefined ? isActive : (existing?.isActive ?? true);

    let encryptedCreds = existing?.credentials;
    if (credentials && typeof credentials === 'object' && Object.keys(credentials).length > 0) {
      encryptedCreds = this.cryptoService.encryptCredentials(credentials);
    }

    const config = await this.configRepo.upsertIntegration(serviceName, {
      environment: updatedEnv,
      credentials: encryptedCreds || {},
      isActive: updatedIsActive,
      updatedBy,
    });

    // Invalidate Redis integration config cache
    await this.cacheService.del(`configs:integrations:${serviceName}`);

    // Return masked credentials response matching GetConfigsQueryHandler format
    let maskedCredentials = {};
    try {
      if (config.credentials) {
        const decrypted = this.cryptoService.decryptCredentials(config.credentials);
        maskedCredentials = this.maskObj(decrypted);
      }
    } catch {
      maskedCredentials = { status: 'Encrypted' };
    }

    return {
      ...config,
      credentials: maskedCredentials,
    };
  }

  private maskObj(obj: any): any {
    if (!obj || typeof obj !== 'object') return obj;
    const masked: any = {};
    for (const key of Object.keys(obj)) {
      if (typeof obj[key] === 'string') {
        const str = obj[key];
        if (str.length <= 4) {
          masked[key] = '****';
        } else {
          masked[key] = '****' + str.substring(str.length - 4);
        }
      } else if (typeof obj[key] === 'object') {
        masked[key] = this.maskObj(obj[key]);
      } else {
        masked[key] = obj[key];
      }
    }
    return masked;
  }
}
