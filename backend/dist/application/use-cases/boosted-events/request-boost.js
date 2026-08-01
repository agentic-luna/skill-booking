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
        const now = new Date();
        // Check if target event exists and meets boosting requirements
        const event = await prisma_1.prisma.event.findUnique({
            where: { id: eventId },
        });
        if (!event) {
            throw new errors_1.NotFoundError('Event not found');
        }
        if (event.status !== 'APPROVED') {
            throw new errors_1.BadRequestError('Only approved events can be boosted.');
        }
        if (event.startTime >= now) {
            throw new errors_1.BadRequestError('Only events with a start date less than current date can be boosted.');
        }
        // Check for existing active non-expired boost campaign
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
        let amount = null;
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
                if (plan && plan.price !== undefined && plan.price !== null) {
                    amount = Number(plan.price);
                }
            }
        }
        if (amount === null || isNaN(amount)) {
            throw new errors_1.BadRequestError('Boost pricing is not configured. Admin has to configure boost pricing.');
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
