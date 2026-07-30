"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestBoostCommandHandler = exports.RequestBoostCommand = void 0;
class RequestBoostCommand {
    eventId;
    durationDays;
    tier;
    __tag = 'RequestBoostCommand';
    constructor(eventId, durationDays, tier = 'BASIC') {
        this.eventId = eventId;
        this.durationDays = durationDays;
        this.tier = tier;
    }
}
exports.RequestBoostCommand = RequestBoostCommand;
class RequestBoostCommandHandler {
    boostedRepo;
    commsService;
    configRepo;
    constructor(boostedRepo, commsService, configRepo) {
        this.boostedRepo = boostedRepo;
        this.commsService = commsService;
        this.configRepo = configRepo;
    }
    async handle(command) {
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + command.durationDays);
        // Fetch dynamic pricing
        const pricingConfig = await this.configRepo.findPlatformSetting('BOOST_PRICING');
        let amount = 500;
        if (pricingConfig && pricingConfig.value && Array.isArray(pricingConfig.value)) {
            const plan = pricingConfig.value.find((p) => p.tier === command.tier && p.days === command.durationDays);
            if (plan && plan.price) {
                amount = plan.price;
            }
        }
        const boostRequest = await this.boostedRepo.upsert(command.eventId, {
            priority: command.tier === 'PRO' ? 3 : command.tier === 'STANDARD' ? 2 : 1,
            tier: command.tier,
            price: amount,
            startDate,
            endDate,
            isActive: false, // Wait for payment verification
        });
        // Create Razorpay Order
        const razorpayOrder = await this.commsService.createRazorpayOrder(amount, 'INR', boostRequest.id);
        return { boostRequest, razorpayOrder };
    }
}
exports.RequestBoostCommandHandler = RequestBoostCommandHandler;
