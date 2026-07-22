import { IntegrationEnvironment, IntegrationService } from '@prisma/client';
import { IConfigRepository } from '../../../domain/repositories/config.repository';
import { ICryptoService } from '../../services/crypto.service';
import { ICacheService } from '../../services/cache.service';
import { IRequest, IRequestHandler } from '../../common/mediator';
import { BadRequestError } from '../../../api/common/errors';

export class SetupRazorpayCommand implements IRequest<any> {
  readonly __tag = 'SetupRazorpayCommand';
  constructor(
    public readonly environment: IntegrationEnvironment,
    public readonly keyId: string,
    public readonly keySecret: string,
    public readonly webhookSecret: string,
    public readonly isActive: boolean,
    public readonly updatedBy: string
  ) {}
}

export class SetupRazorpayCommandHandler implements IRequestHandler<SetupRazorpayCommand, any> {
  constructor(
    private configRepo: IConfigRepository,
    private cryptoService: ICryptoService,
    private cacheService: ICacheService
  ) {}

  async handle(command: SetupRazorpayCommand): Promise<any> {
    const { environment, keyId, keySecret, webhookSecret, isActive, updatedBy } = command;
    
    if (!environment || !Object.values(IntegrationEnvironment).includes(environment)) {
      throw new BadRequestError('Invalid environment. Expected TEST or LIVE');
    }

    if (!keyId || !keySecret || !webhookSecret) {
        throw new BadRequestError('Missing required Razorpay credentials');
    }

    const credentials = {
        keyId,
        keySecret,
        webhookSecret
    };

    const encrypted = this.cryptoService.encryptCredentials(credentials);

    const config = await this.configRepo.upsertIntegration(IntegrationService.RAZORPAY, {
      environment,
      credentials: encrypted,
      isActive,
      updatedBy,
    });

    await this.cacheService.del(`configs:integrations:${IntegrationService.RAZORPAY}`);

    return config;
  }
}
