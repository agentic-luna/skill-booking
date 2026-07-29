"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestBoostCommandHandler = exports.RequestBoostCommand = void 0;
class RequestBoostCommand {
    eventId;
    durationDays;
    __tag = 'RequestBoostCommand';
    constructor(eventId, durationDays) {
        this.eventId = eventId;
        this.durationDays = durationDays;
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
        const boostRequest = await this.boostedRepo.upsert(command.eventId, {
            priority: 1,
            startDate,
            endDate,
            isActive: false, // Wait for payment verification
        });
        // Fetch dynamic pricing
        let pricing = {
            "7": 500,
            "15": 900,
            "30": 1500
        };
        const pricingConfig = await this.configRepo.findPlatformSetting('BOOST_PRICING');
        if (pricingConfig && pricingConfig.value) {
            pricing = pricingConfig.value;
        }
        const amount = pricing[command.durationDays.toString()] || 500;
        // Create Razorpay Order
        const razorpayOrder = await this.commsService.createRazorpayOrder(amount, 'INR', boostRequest.id);
        return { boostRequest, razorpayOrder };
    }
}
exports.RequestBoostCommandHandler = RequestBoostCommandHandler;
