import { IRequest, IRequestHandler } from '../../common/mediator';
import { IConfigRepository } from '../../../domain/repositories/config.repository';

export class GetBoostPricingQuery implements IRequest<any> {
  readonly __tag = 'GetBoostPricingQuery';
}

export class GetBoostPricingQueryHandler implements IRequestHandler<GetBoostPricingQuery, any> {
  constructor(private configRepo: IConfigRepository) {}

  async handle(query: GetBoostPricingQuery): Promise<any> {
    const setting = await this.configRepo.findPlatformSetting('BOOST_PRICING');
    if (setting && setting.value) {
      return setting.value;
    }
    // Default fallback if not configured by admin
    return {
      "7": 500,
      "15": 900,
      "30": 1500
    };
  }
}
