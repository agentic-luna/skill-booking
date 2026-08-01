import { IRequest, IRequestHandler } from '../../common/mediator';
import { IConfigRepository } from '../../../domain/repositories/config.repository';

export class GetBoostPricingQuery implements IRequest<any> {
  readonly __tag = 'GetBoostPricingQuery';
}

export class GetBoostPricingQueryHandler implements IRequestHandler<GetBoostPricingQuery, any> {
  constructor(private configRepo: IConfigRepository) {}

  async handle(query: GetBoostPricingQuery): Promise<any> {
    const basicFeatures = [
      "Featured Badge",
      "Homepage Featured Section",
      "Top Event Listings",
      "Featured Events Page",
      "Basic Analytics"
    ];

    const standardFeatures = [
      "Featured Badge",
      "Homepage Featured Section",
      "Top Event Listings",
      "Featured Events Page",
      "Search Priority",
      "Category Featured",
      "Recommendation Priority",
      "Trending Events Section",
      "Enhanced Analytics"
    ];

    const proFeatures = [
      "Featured Badge",
      "Homepage Featured Section",
      "Top Event Listings",
      "Featured Events Page",
      "Search Priority",
      "Category Featured",
      "Recommendation Priority",
      "Trending Events Section",
      "Homepage Hero Banner",
      "Homepage Featured Carousel",
      "Highest Search Ranking",
      "Priority Recommendations",
      "Featured Organizer Badge",
      "Email Campaign",
      "Push Notifications",
      "Premium Analytics",
      "Priority Support"
    ];

    const getFeatures = (tier: string) => {
      const t = (tier || '').toUpperCase();
      if (t === 'PRO') return proFeatures;
      if (t === 'STANDARD') return standardFeatures;
      return basicFeatures;
    };

    const setting = await this.configRepo.findPlatformSetting('BOOST_PRICING');
    if (setting && setting.value) {
      let parsed = setting.value;
      if (typeof parsed === 'string') {
        try {
          parsed = JSON.parse(parsed);
        } catch {
          parsed = null;
        }
      }
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((item: any) => ({
          ...item,
          features: item.features || getFeatures(item.tier),
        }));
      }
    }

    // If not configured by admin, return empty array
    return [];
  }
}
