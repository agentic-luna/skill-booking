"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BoostedEventsController = void 0;
const di_container_1 = require("../di-container");
const boost_event_1 = require("../../application/use-cases/boosted-events/boost-event");
const get_boosted_events_1 = require("../../application/use-cases/boosted-events/get-boosted-events");
const request_boost_1 = require("../../application/use-cases/boosted-events/request-boost");
const update_boost_status_1 = require("../../application/use-cases/boosted-events/update-boost-status");
const verify_boost_payment_1 = require("../../application/use-cases/boosted-events/verify-boost-payment");
const get_boost_pricing_1 = require("../../application/use-cases/boosted-events/get-boost-pricing");
const api_response_1 = require("../common/api-response");
const prisma_1 = require("../../config/prisma");
const get_boost_analytics_1 = require("../../application/use-cases/boosted-events/get-boost-analytics");
const track_boost_click_1 = require("../../application/use-cases/boosted-events/track-boost-click");
const pagination_1 = require("../common/pagination");
class BoostedEventsController {
    static async getActiveBoostedEvents(req, res, next) {
        try {
            const result = await di_container_1.mediator.send(new get_boosted_events_1.GetBoostedEventsQuery());
            return api_response_1.ApiResponse.success(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    static async getPricing(req, res, next) {
        try {
            const result = await di_container_1.mediator.send(new get_boost_pricing_1.GetBoostPricingQuery());
            return api_response_1.ApiResponse.success(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    static async boostEvent(req, res, next) {
        try {
            const { eventId, priority, startDate, endDate, isActive } = req.body;
            const result = await di_container_1.mediator.send(new boost_event_1.BoostEventCommand(eventId, Number(priority), startDate, endDate, isActive !== undefined ? isActive : true));
            return api_response_1.ApiResponse.success(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    static async requestBoost(req, res, next) {
        try {
            const { eventId, durationDays, tier } = req.body;
            const result = await di_container_1.mediator.send(new request_boost_1.RequestBoostCommand(eventId, durationDays ? Number(durationDays) : undefined, tier));
            return api_response_1.ApiResponse.success(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    static async updateBoostStatus(req, res, next) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const result = await di_container_1.mediator.send(new update_boost_status_1.UpdateBoostStatusCommand(id, status));
            return api_response_1.ApiResponse.success(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    static async verifyBoostPayment(req, res, next) {
        try {
            const { boostId, razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;
            const result = await di_container_1.mediator.send(new verify_boost_payment_1.VerifyBoostPaymentCommand(boostId, razorpayPaymentId, razorpayOrderId, razorpaySignature));
            return api_response_1.ApiResponse.success(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    static async getBoostRequests(req, res, next) {
        try {
            const { page, limit, skip } = (0, pagination_1.parsePaginationParams)(req.query, 10);
            const [items, total] = await Promise.all([
                prisma_1.prisma.boostedEvent.findMany({
                    skip,
                    take: limit,
                    include: {
                        event: {
                            include: {
                                host: {
                                    include: { user: true }
                                }
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' },
                }),
                prisma_1.prisma.boostedEvent.count(),
            ]);
            const paginated = (0, pagination_1.buildPaginatedResponse)(items, total, page, limit);
            return api_response_1.ApiResponse.success(res, paginated);
        }
        catch (error) {
            next(error);
        }
    }
    static async getAnalytics(req, res, next) {
        try {
            const { eventId } = req.params;
            const result = await di_container_1.mediator.send(new get_boost_analytics_1.GetBoostAnalyticsQuery(eventId));
            return api_response_1.ApiResponse.success(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    static async trackClick(req, res, next) {
        try {
            const { eventId } = req.body;
            const result = await di_container_1.mediator.send(new track_boost_click_1.TrackBoostClickCommand(eventId));
            return api_response_1.ApiResponse.success(res, result);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.BoostedEventsController = BoostedEventsController;
