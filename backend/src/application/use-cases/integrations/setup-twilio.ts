import { IntegrationEnvironment, IntegrationService } from '@prisma/client';
import { IConfigRepository } from '../../../domain/repositories/config.repository';
import { ICryptoService } from '../../services/crypto.service';
import { ICacheService } from '../../services/cache.service';
import { IRequest, IRequestHandler } from '../../common/mediator';
import { BadRequestError } from '../../../api/common/errors';

export class SetupTwilioCommand implements IRequest<any> {
  readonly __tag = 'SetupTwilioCommand';
  constructor(
    public readonly environment: IntegrationEnvironment,
    public readonly accountSid: string,
    public readonly authToken: string,
    public readonly fromNumber: string,
    public readonly isActive: boolean,
    public readonly updatedBy: string
  ) {}
}

export class SetupTwilioCommandHandler implements IRequestHandler<SetupTwilioCommand, any> {
  constructor(
    private configRepo: IConfigRepository,
    private cryptoService: ICryptoService,
    private cacheService: ICacheService
  ) {}

  async handle(command: SetupTwilioCommand): Promise<any> {
    const { environment, accountSid, authToken, fromNumber, isActive, updatedBy } = command;
    
    if (!accountSid || !authToken || !fromNumber) {
        throw new BadRequestError('Missing required Twilio credentials');
    }

    const credentials = {
        accountSid,
        authToken,
        fromNumber
    };

    const encrypted = this.cryptoService.encryptCredentials(credentials);

    const config = await this.configRepo.upsertIntegration(IntegrationService.TWILIO, {
      environment,
      credentials: encrypted,
      isActive,
      updatedBy,
    });

    await this.cacheService.del(`configs:integrations:${IntegrationService.TWILIO}`);

    return config;
  }
}
