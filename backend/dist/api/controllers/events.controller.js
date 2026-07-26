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
            const { title, posterUrl, mode, venue, instructor, startTime, totalSeats, price, duration, description, category } = req.body;
            const event = await di_container_1.mediator.send(new create_event_1.CreateEventCommand(req.user.id, {
                title,
                posterUrl,
                mode: mode,
                venue,
                instructor,
                startTime,
                totalSeats: Number(totalSeats),
                price: price !== undefined ? Number(price) : undefined,
                duration: duration !== undefined ? String(duration) : undefined,
                description: description !== undefined ? String(description) : undefined,
                category: category !== undefined ? String(category) : undefined,
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
            const { title, posterUrl, mode, venue, instructor, startTime, totalSeats, price, duration, description } = req.body;
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
            let instructorId = event.instructorId;
            let venueId = event.venueId;
            if (instructor !== undefined && instructor !== null && typeof instructor === 'object') {
                const details = instructor;
                if (instructorId) {
                    await prisma_1.prisma.instructor.update({
                        where: { id: instructorId },
                        data: {
                            name: details.name !== undefined ? details.name : undefined,
                            bio: details.bio !== undefined ? details.bio : undefined,
                            photoUrl: details.photoUrl !== undefined ? details.photoUrl : undefined,
                            companyName: details.companyName !== undefined ? details.companyName : undefined,
                            facebook: details.facebook !== undefined ? details.facebook : undefined,
                            instagram: details.instagram !== undefined ? details.instagram : undefined,
                            linkedin: details.linkedin !== undefined ? details.linkedin : undefined,
                        },
                    });
                }
                else if (details.name) {
                    const inst = await prisma_1.prisma.instructor.create({
                        data: {
                            name: details.name,
                            bio: details.bio || '',
                            photoUrl: details.photoUrl || '',
                            companyName: details.companyName || '',
                            facebook: details.facebook || null,
                            instagram: details.instagram || null,
                            linkedin: details.linkedin || null,
                        },
                    });
                    instructorId = inst.id;
                }
            }
            if (venue !== undefined && venue !== null && typeof venue === 'object') {
                const address = venue.address;
                const meetingLink = venue.meetingLink;
                if (venueId) {
                    await prisma_1.prisma.venue.update({
                        where: { id: venueId },
                        data: {
                            address: address !== undefined ? address : undefined,
                            meetingLink: meetingLink !== undefined ? meetingLink : undefined,
                        },
                    });
                }
                else if (address !== undefined || meetingLink !== undefined) {
                    const v = await prisma_1.prisma.venue.create({
                        data: {
                            address: address || '',
                            meetingLink: meetingLink || null,
                        },
                    });
                    venueId = v.id;
                }
            }
            const updatedEvent = await prisma_1.prisma.event.update({
                where: { id },
                data: {
                    title: title !== undefined ? title : event.title,
                    posterUrl: posterUrl !== undefined ? posterUrl : event.posterUrl,
                    mode: mode !== undefined ? mode : event.mode,
                    startTime: startTime !== undefined ? new Date(startTime) : event.startTime,
                    totalSeats: totalSeats !== undefined ? Number(totalSeats) : event.totalSeats,
                    availableSeats: totalSeats !== undefined ? Number(totalSeats) : event.availableSeats,
                    price: price !== undefined ? Number(price) : event.price,
                    duration: duration !== undefined ? String(duration) : event.duration,
                    description: description !== undefined ? String(description) : event.description,
                    instructorId,
                    venueId,
                    venueDetails: (venue?.district ? { district: venue.district } : event.venueDetails),
                },
                include: {
                    instructor: true,
                    venue: true,
                    commission: true,
                    host: {
                        select: {
                            id: true,
                            user: {
                                select: {
                                    firstName: true,
                                    lastName: true,
                                    email: true,
                                    phone: true,
                                },
                            },
                        },
                    },
                },
            });
            const mappedEvent = {
                ...updatedEvent,
                availableSeats: Number(updatedEvent.availableSeats),
                totalSeats: Number(updatedEvent.totalSeats),
                version: Number(updatedEvent.version),
            };
            if (updatedEvent.instructor || updatedEvent.venue || updatedEvent.venueDetails) {
                mappedEvent.venueDetails = {
                    address: updatedEvent.venue?.address || '',
                    meetingLink: updatedEvent.venue?.meetingLink || '',
                    district: updatedEvent.venueDetails?.district || '',
                    instructorName: updatedEvent.instructor?.name || '',
                    companyName: updatedEvent.instructor?.companyName || '',
                    instructorBio: updatedEvent.instructor?.bio || '',
                    instructorPhoto: updatedEvent.instructor?.photoUrl || '',
                    instagram: updatedEvent.instructor?.instagram || '',
                    linkedin: updatedEvent.instructor?.linkedin || '',
                    facebook: updatedEvent.instructor?.facebook || '',
                };
            }
            return api_response_1.ApiResponse.success(res, mappedEvent);
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
    static async requestEdit(req, res, next) {
        try {
            const { id } = req.params;
            const { reason } = req.body;
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
            // 4. Create edit request
            const editRequest = await prisma_1.prisma.editRequest.create({
                data: {
                    eventId: event.id,
                    hostId: hostProfile.id,
                    reason: reason || null,
                    status: 'PENDING',
                }
            });
            return api_response_1.ApiResponse.success(res, { message: 'Edit request submitted.', editRequest });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.EventsController = EventsController;
