"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetBoostPricingQueryHandler = exports.GetBoostPricingQuery = void 0;
class GetBoostPricingQuery {
    __tag = 'GetBoostPricingQuery';
}
exports.GetBoostPricingQuery = GetBoostPricingQuery;
class GetBoostPricingQueryHandler {
    configRepo;
    constructor(configRepo) {
        this.configRepo = configRepo;
    }
    async handle(query) {
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
exports.GetBoostPricingQueryHandler = GetBoostPricingQueryHandler;
