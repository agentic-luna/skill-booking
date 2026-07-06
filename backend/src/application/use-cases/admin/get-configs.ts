import { IConfigRepository } from '../../../domain/repositories/config.repository';
import { ICryptoService } from '../../services/crypto.service';
import { IRequest, IRequestHandler } from '../../common/mediator';

export class GetConfigsQuery implements IRequest<any[]> {
  readonly __tag = 'GetConfigsQuery';
}

export class GetConfigsQueryHandler implements IRequestHandler<GetConfigsQuery, any[]> {
  constructor(
    private configRepo: IConfigRepository,
    private cryptoService: ICryptoService
  ) {}

  async handle(query: GetConfigsQuery): Promise<any[]> {
    const configs = await this.configRepo.findAllIntegrations();
    return configs.map((c) => {
      let credentials = {};
      try {
        const decrypted = this.cryptoService.decryptCredentials(c.credentials);
        credentials = this.maskObj(decrypted);
      } catch (err) {
        credentials = { error: 'Failed to decrypt credentials' };
      }
      return {
        ...c,
        credentials,
      };
    });
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
