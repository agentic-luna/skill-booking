"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BoostedEventsController = void 0;
const di_container_1 = require("../di-container");
const boost_event_1 = require("../../application/use-cases/boosted-events/boost-event");
const get_boosted_events_1 = require("../../application/use-cases/boosted-events/get-boosted-events");
const api_response_1 = require("../common/api-response");
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
}
exports.BoostedEventsController = BoostedEventsController;
