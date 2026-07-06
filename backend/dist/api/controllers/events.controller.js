"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsController = void 0;
const di_container_1 = require("../di-container");
const search_events_1 = require("../../application/use-cases/events/search-events");
const get_event_details_1 = require("../../application/use-cases/events/get-event-details");
const create_event_1 = require("../../application/use-cases/events/create-event");
const api_response_1 = require("../common/api-response");
class EventsController {
    static async getEvents(req, res, next) {
        try {
            const { title, mode, hostId, startTimeFrom } = req.query;
            const events = await di_container_1.mediator.send(new search_events_1.SearchEventsQuery({
                title: title,
                mode: mode,
                hostId: hostId,
                startTimeFrom: startTimeFrom,
            }));
            return api_response_1.ApiResponse.success(res, events);
        }
        catch (error) {
            next(error);
        }
    }
    static async getEventDetails(req, res, next) {
        try {
            const { id } = req.params;
            const event = await di_container_1.mediator.send(new get_event_details_1.GetEventDetailsQuery(id));
            return api_response_1.ApiResponse.success(res, event);
        }
        catch (error) {
            next(error);
        }
    }
    static async createEvent(req, res, next) {
        try {
            const { title, posterUrl, mode, venueDetails, startTime, totalSeats } = req.body;
            const event = await di_container_1.mediator.send(new create_event_1.CreateEventCommand(req.user.id, {
                title,
                posterUrl,
                mode: mode,
                venueDetails,
                startTime,
                totalSeats: Number(totalSeats),
            }));
            return api_response_1.ApiResponse.created(res, event);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.EventsController = EventsController;
