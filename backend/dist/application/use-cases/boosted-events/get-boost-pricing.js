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
            // value might be stored as a JSON string (old format) or a native array (new format)
            let parsed = setting.value;
            if (typeof parsed === 'string') {
                try {
                    parsed = JSON.parse(parsed);
                }
                catch {
                    // ignore parse error, fall through to defaults
                    parsed = null;
                }
            }
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed;
            }
        }
        // Default fallback if not configured by admin
        return [
            { id: "def-basic-7", tier: "BASIC", days: 7, price: 400 },
            { id: "def-basic-15", tier: "BASIC", days: 15, price: 800 },
            { id: "def-basic-30", tier: "BASIC", days: 30, price: 2000 },
            { id: "def-standard-7", tier: "STANDARD", days: 7, price: 600 },
            { id: "def-standard-15", tier: "STANDARD", days: 15, price: 1200 },
            { id: "def-standard-30", tier: "STANDARD", days: 30, price: 3000 },
            { id: "def-pro-7", tier: "PRO", days: 7, price: 1000 },
            { id: "def-pro-15", tier: "PRO", days: 15, price: 2000 },
            { id: "def-pro-30", tier: "PRO", days: 30, price: 5000 },
        ];
    }
}
exports.GetBoostPricingQueryHandler = GetBoostPricingQueryHandler;
