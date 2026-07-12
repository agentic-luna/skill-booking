"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsController = void 0;
const di_container_1 = require("../di-container");
const prisma_1 = require("../../config/prisma");
const errors_1 = require("../common/errors");
const search_events_1 = require("../../application/use-cases/events/search-events");
const get_event_details_1 = require("../../application/use-cases/events/get-event-details");
const create_event_1 = require("../../application/use-cases/events/create-event");
const manage_event_likes_1 = require("../../application/use-cases/likes/manage-event-likes");
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
            const { title, posterUrl, mode, venueDetails, startTime, totalSeats, price, duration, description } = req.body;
            const event = await di_container_1.mediator.send(new create_event_1.CreateEventCommand(req.user.id, {
                title,
                posterUrl,
                mode: mode,
                venueDetails,
                startTime,
                totalSeats: Number(totalSeats),
                price: price !== undefined ? Number(price) : undefined,
                duration: duration !== undefined ? String(duration) : undefined,
                description: description !== undefined ? String(description) : undefined,
            }));
            return api_response_1.ApiResponse.created(res, event);
        }
        catch (error) {
            next(error);
        }
    }
    static async updateEvent(req, res, next) {
        try {
            const { id } = req.params;
            const { title, posterUrl, mode, venueDetails, startTime, totalSeats, price, duration, description } = req.body;
            // 1. Fetch host profile first to verify ownership
            const hostProfile = await prisma_1.prisma.hostProfile.findUnique({
                where: { userId: req.user.id },
            });
            if (!hostProfile) {
                throw new errors_1.BadRequestError('Host Profile not found.');
            }
            // 2. Fetch the event
            const event = await prisma_1.prisma.event.findUnique({
                where: { id },
            });
            if (!event) {
                return res.status(404).json({
                    success: false,
                    error: { message: 'Event not found.' },
                });
            }
            // 3. Verify ownership
            if (event.hostId !== hostProfile.id) {
                return res.status(403).json({
                    success: false,
                    error: { message: 'Access denied. You do not own this event.' },
                });
            }
            // 4. Verify status is PENDING (edit is only allowed before approval)
            if (event.status !== 'PENDING') {
                throw new errors_1.BadRequestError('Cannot edit this event as it has already been approved or processed.');
            }
            // 5. Update event
            const updatedEvent = await prisma_1.prisma.event.update({
                where: { id },
                data: {
                    title: title !== undefined ? title : event.title,
                    posterUrl: posterUrl !== undefined ? posterUrl : event.posterUrl,
                    mode: mode !== undefined ? mode : event.mode,
                    venueDetails: venueDetails !== undefined ? venueDetails : event.venueDetails,
                    startTime: startTime !== undefined ? new Date(startTime) : event.startTime,
                    totalSeats: totalSeats !== undefined ? Number(totalSeats) : event.totalSeats,
                    availableSeats: totalSeats !== undefined ? Number(totalSeats) : event.availableSeats,
                    price: price !== undefined ? Number(price) : event.price,
                    duration: duration !== undefined ? String(duration) : event.duration,
                    description: description !== undefined ? String(description) : event.description,
                },
            });
            return api_response_1.ApiResponse.success(res, updatedEvent);
        }
        catch (error) {
            next(error);
        }
    }
    static async deleteEvent(req, res, next) {
        try {
            const { id } = req.params;
            // 1. Fetch host profile
            const hostProfile = await prisma_1.prisma.hostProfile.findUnique({
                where: { userId: req.user.id },
            });
            if (!hostProfile) {
                throw new errors_1.BadRequestError('Host Profile not found.');
            }
            // 2. Fetch the event
            const event = await prisma_1.prisma.event.findUnique({
                where: { id },
            });
            if (!event) {
                return res.status(404).json({
                    success: false,
                    error: { message: 'Event not found.' },
                });
            }
            // 3. Verify ownership
            if (event.hostId !== hostProfile.id) {
                return res.status(403).json({
                    success: false,
                    error: { message: 'Access denied. You do not own this event.' },
                });
            }
            // 4. Verify status is PENDING
            if (event.status !== 'PENDING') {
                throw new errors_1.BadRequestError('Cannot delete this event as it has already been approved or processed.');
            }
            // 5. Delete event
            await prisma_1.prisma.event.delete({
                where: { id },
            });
            return api_response_1.ApiResponse.success(res, { message: 'Event deleted successfully.' });
        }
        catch (error) {
            next(error);
        }
    }
    static async toggleLike(req, res, next) {
        try {
            const { id } = req.params;
            const result = await di_container_1.mediator.send(new manage_event_likes_1.ToggleEventLikeCommand(req.user.id, id));
            return api_response_1.ApiResponse.success(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    static async getLikedEvents(req, res, next) {
        try {
            const result = await di_container_1.mediator.send(new manage_event_likes_1.GetUserLikedEventsQuery(req.user.id));
            return api_response_1.ApiResponse.success(res, result);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.EventsController = EventsController;
