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

    // Default fallback if not configured by admin
    return [
      { id: "def-basic-3", tier: "BASIC", days: 3, price: 299, features: basicFeatures },
      { id: "def-basic-7", tier: "BASIC", days: 7, price: 599, features: basicFeatures },
      { id: "def-basic-15", tier: "BASIC", days: 15, price: 999, features: basicFeatures },
      { id: "def-basic-30", tier: "BASIC", days: 30, price: 1699, features: basicFeatures },
      { id: "def-standard-3", tier: "STANDARD", days: 3, price: 699, features: standardFeatures },
      { id: "def-standard-7", tier: "STANDARD", days: 7, price: 1299, features: standardFeatures },
      { id: "def-standard-15", tier: "STANDARD", days: 15, price: 2199, features: standardFeatures },
      { id: "def-standard-30", tier: "STANDARD", days: 30, price: 3799, features: standardFeatures },
      { id: "def-pro-3", tier: "PRO", days: 3, price: 1999, features: proFeatures },
      { id: "def-pro-7", tier: "PRO", days: 7, price: 3999, features: proFeatures },
      { id: "def-pro-15", tier: "PRO", days: 15, price: 6999, features: proFeatures },
      { id: "def-pro-30", tier: "PRO", days: 30, price: 11999, features: proFeatures },
    ];
  }
}
