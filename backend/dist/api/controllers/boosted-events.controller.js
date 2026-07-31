"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BoostedEventsController = void 0;
const di_container_1 = require("../di-container");
const boost_event_1 = require("../../application/use-cases/boosted-events/boost-event");
const get_boosted_events_1 = require("../../application/use-cases/boosted-events/get-boosted-events");
const request_boost_1 = require("../../application/use-cases/boosted-events/request-boost");
const update_boost_status_1 = require("../../application/use-cases/boosted-events/update-boost-status");
const get_boost_requests_1 = require("../../application/use-cases/boosted-events/get-boost-requests");
const verify_boost_payment_1 = require("../../application/use-cases/boosted-events/verify-boost-payment");
const get_boost_pricing_1 = require("../../application/use-cases/boosted-events/get-boost-pricing");
const api_response_1 = require("../common/api-response");
const prisma_1 = require("../../config/prisma");
class BoostedEventsController {
    static async getRazorpayKey(req, res, next) {
        try {
            const config = await prisma_1.prisma.integrationConfig.findUnique({
                where: { serviceName: 'RAZORPAY' }
            });
            const keyId = config?.isActive && config.credentials && typeof config.credentials === 'object'
                ? config.credentials.keyId
                : null;
            return api_response_1.ApiResponse.success(res, { keyId });
        }
        catch (error) {
            next(error);
        }
    }
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
            const result = await di_container_1.mediator.send(new request_boost_1.RequestBoostCommand(eventId, Number(durationDays), tier));
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
            const result = await di_container_1.mediator.send(new get_boost_requests_1.GetBoostRequestsQuery());
            return api_response_1.ApiResponse.success(res, result);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.BoostedEventsController = BoostedEventsController;
