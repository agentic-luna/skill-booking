"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestBoostCommandHandler = exports.RequestBoostCommand = void 0;
const errors_1 = require("../../common/errors");
const prisma_1 = require("../../../config/prisma");
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
        const { eventId, tier } = command;
        // Check for existing active non-expired boost campaign
        const now = new Date();
        const existingActiveBoost = await prisma_1.prisma.boostedEvent.findFirst({
            where: {
                eventId,
                isActive: true,
                status: { in: ['ACTIVE', 'APPROVED'] },
                endDate: { gte: now },
            },
        });
        if (existingActiveBoost) {
            throw new errors_1.ConflictError(`This event already has an active ${existingActiveBoost.tier} promotion campaign running until ${new Date(existingActiveBoost.endDate).toLocaleDateString()}.`);
        }
        // Default duration days per plan tier if not explicitly specified
        let durationDays = command.durationDays;
        if (!durationDays || durationDays <= 0) {
            if (tier === 'PRO')
                durationDays = 30;
            else if (tier === 'STANDARD')
                durationDays = 15;
            else
                durationDays = 7;
        }
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + durationDays);
        // Fetch dynamic pricing
        const pricingConfig = await this.configRepo.findPlatformSetting('BOOST_PRICING');
        let amount = 500; // default fallback
        if (pricingConfig && pricingConfig.value) {
            let parsed = pricingConfig.value;
            if (typeof parsed === 'string') {
                try {
                    parsed = JSON.parse(parsed);
                }
                catch {
                    parsed = null;
                }
            }
            if (Array.isArray(parsed) && parsed.length > 0) {
                const plan = parsed.find((p) => p.tier.toUpperCase() === command.tier.toUpperCase() &&
                    Number(p.days) === Number(command.durationDays));
                if (plan && plan.price !== undefined) {
                    amount = Number(plan.price);
                }
            }
        }
        else {
            // Hardcoded fallback matching default array from GetBoostPricingQueryHandler
            const fallbacks = [
                { tier: "BASIC", days: 7, price: 400 },
                { tier: "BASIC", days: 15, price: 800 },
                { tier: "BASIC", days: 30, price: 2000 },
                { tier: "STANDARD", days: 7, price: 600 },
                { tier: "STANDARD", days: 15, price: 1200 },
                { tier: "STANDARD", days: 30, price: 3000 },
                { tier: "PRO", days: 7, price: 1000 },
                { tier: "PRO", days: 15, price: 2000 },
                { tier: "PRO", days: 30, price: 5000 },
            ];
            const plan = fallbacks.find((p) => p.tier.toUpperCase() === command.tier.toUpperCase() &&
                Number(p.days) === Number(command.durationDays));
            if (plan) {
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
        // Save razorpayOrderId into boost request
        let updatedBoost = boostRequest;
        if (razorpayOrder && razorpayOrder.id) {
            updatedBoost = await this.boostedRepo.updatePaymentDetails(boostRequest.id, {
                razorpayOrderId: razorpayOrder.id,
                paymentGateway: 'RAZORPAY',
            });
        }
        return { boostRequest: updatedBoost, razorpayOrder };
    }
}
exports.RequestBoostCommandHandler = RequestBoostCommandHandler;
