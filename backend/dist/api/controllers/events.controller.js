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
            const { title, mode, hostId, startTimeFrom, category, district, keywords, minPrice, maxPrice, sortBy, sortOrder } = req.query;
            let keywordsArr = undefined;
            if (keywords) {
                if (Array.isArray(keywords)) {
                    keywordsArr = keywords.map(String);
                }
                else {
                    keywordsArr = [String(keywords)];
                }
            }
            const events = await di_container_1.mediator.send(new search_events_1.SearchEventsQuery({
                title: title,
                mode: mode,
                hostId: hostId,
                startTimeFrom: startTimeFrom,
                category: category,
                district: district,
                keywords: keywordsArr,
                minPrice: minPrice ? Number(minPrice) : undefined,
                maxPrice: maxPrice ? Number(maxPrice) : undefined,
                sortBy: sortBy,
                sortOrder: sortOrder,
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
            const { title, posterUrl, images, mode, venue, instructor, startTime, totalSeats, price, duration, description, category, keywords, videoUrls, ticketTypes } = req.body;
            const event = await di_container_1.mediator.send(new create_event_1.CreateEventCommand(req.user.id, {
                title,
                posterUrl,
                images: Array.isArray(images) ? images : [],
                mode: mode,
                venue,
                instructor,
                startTime,
                totalSeats: totalSeats !== undefined && totalSeats !== null ? Number(totalSeats) : 0,
                price: price !== undefined ? Number(price) : undefined,
                duration: duration !== undefined ? String(duration) : undefined,
                description: description !== undefined ? String(description) : undefined,
                category: category !== undefined ? String(category) : undefined,
                keywords: Array.isArray(keywords) ? keywords : [],
                videoUrls: Array.isArray(videoUrls) ? videoUrls : (videoUrls ? [videoUrls] : []),
                ticketTypes: Array.isArray(ticketTypes) ? ticketTypes : undefined,
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
            const { title, posterUrl, mode, venue, instructor, startTime, totalSeats, price, duration, description, category, keywords, videoUrls } = req.body;
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
            // 4. Verify status allows editing: PENDING (new event) or EDIT_MODE (admin-approved edit)
            if (event.status !== 'PENDING' && event.status !== 'EDIT_MODE') {
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
            // If event was in EDIT_MODE, transition it back to PENDING after host saves,
            // so the admin must re-approve the updated version.
            const newStatus = event.status === 'EDIT_MODE' ? 'PENDING' : undefined;
            const updatedEvent = await prisma_1.prisma.event.update({
                where: { id },
                data: {
                    ...(newStatus ? { status: newStatus } : {}),
                    title: title !== undefined ? title : event.title,
                    posterUrl: posterUrl !== undefined ? posterUrl : event.posterUrl,
                    mode: mode !== undefined ? mode : event.mode,
                    startTime: startTime !== undefined ? new Date(startTime) : event.startTime,
                    totalSeats: totalSeats !== undefined ? Number(totalSeats) : event.totalSeats,
                    availableSeats: totalSeats !== undefined ? Number(totalSeats) : event.availableSeats,
                    price: price !== undefined ? Number(price) : event.price,
                    duration: duration !== undefined ? String(duration) : event.duration,
                    description: description !== undefined ? String(description) : event.description,
                    category: category !== undefined ? String(category) : event.category,
                    keywords: keywords !== undefined ? (Array.isArray(keywords) ? keywords : []) : undefined,
                    videoUrls: videoUrls !== undefined ? (Array.isArray(videoUrls) ? videoUrls : (videoUrls ? [videoUrls] : [])) : undefined,
                    instructorId,
                    venueId,
                    venueDetails: {
                        district: venue?.district !== undefined ? venue.district : event.venueDetails?.district,
                        endDate: venue?.endDate !== undefined ? venue.endDate : event.venueDetails?.endDate,
                    },
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
                    endDate: updatedEvent.venueDetails?.endDate || '',
                    instructorName: updatedEvent.instructor?.name || '',
                    companyName: updatedEvent.instructor?.companyName || '',
                    instructorBio: updatedEvent.instructor?.bio || '',
                    instructorPhoto: updatedEvent.instructor?.photoUrl || '',
                    instagram: updatedEvent.instructor?.instagram || '',
                    linkedin: updatedEvent.instructor?.linkedin || '',
                    facebook: updatedEvent.instructor?.facebook || '',
                };
            }
            await di_container_1.cacheService.delPattern('events:search:*');
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
            await di_container_1.cacheService.delPattern('events:search:*');
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
    // --- Client-facing ticket types GET endpoint ---
    static async getEventTicketTypes(req, res, next) {
        try {
            const { id, eventId } = req.params;
            const targetEventId = id || eventId;
            const event = await prisma_1.prisma.event.findUnique({
                where: { id: targetEventId },
            });
            if (!event) {
                return res.status(404).json({
                    success: false,
                    error: { message: 'Event not found.' },
                });
            }
            const ticketTypes = await prisma_1.prisma.eventTicketType.findMany({
                where: { eventId: targetEventId },
                orderBy: { createdAt: 'asc' },
            });
            const result = ticketTypes.map((tt) => ({
                id: tt.id,
                eventId: tt.eventId,
                name: tt.name,
                price: Number(tt.price),
                totalSeats: Number(tt.totalSeats),
                bookedSeats: Number(tt.bookedSeats),
                availableSeats: Number(tt.totalSeats) - Number(tt.bookedSeats),
                createdAt: tt.createdAt,
                updatedAt: tt.updatedAt,
            }));
            return api_response_1.ApiResponse.success(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    // --- Host CRUD endpoints for Ticket Types ---
    static async createTicketType(req, res, next) {
        try {
            const { eventId } = req.params;
            const { name, price, totalSeats } = req.body;
            if (!name || typeof name !== 'string' || name.trim() === '') {
                throw new errors_1.BadRequestError('Ticket type name is required.');
            }
            if (price === undefined || price === null || Number(price) < 0) {
                throw new errors_1.BadRequestError('Price must be greater than or equal to 0.');
            }
            if (!totalSeats || Number(totalSeats) <= 0) {
                throw new errors_1.BadRequestError('Total seats must be greater than 0.');
            }
            const hostProfile = await prisma_1.prisma.hostProfile.findUnique({
                where: { userId: req.user.id },
            });
            if (!hostProfile) {
                throw new errors_1.BadRequestError('Host Profile not found.');
            }
            const event = await prisma_1.prisma.event.findUnique({
                where: { id: eventId },
            });
            if (!event) {
                return res.status(404).json({
                    success: false,
                    error: { message: 'Event not found.' },
                });
            }
            if (event.hostId !== hostProfile.id) {
                return res.status(403).json({
                    success: false,
                    error: { message: 'Access denied. You do not own this event.' },
                });
            }
            const count = await prisma_1.prisma.eventTicketType.count({
                where: { eventId },
            });
            if (count >= 10) {
                throw new errors_1.BadRequestError('Maximum limit of 10 ticket types per event reached.');
            }
            const existingName = await prisma_1.prisma.eventTicketType.findUnique({
                where: {
                    eventId_name: {
                        eventId,
                        name: name.trim(),
                    },
                },
            });
            if (existingName) {
                throw new errors_1.BadRequestError(`Ticket type with name "${name.trim()}" already exists for this event.`);
            }
            const ticketType = await prisma_1.prisma.eventTicketType.create({
                data: {
                    eventId,
                    name: name.trim(),
                    price: Number(price),
                    totalSeats: Number(totalSeats),
                    bookedSeats: 0,
                },
            });
            return api_response_1.ApiResponse.created(res, {
                ...ticketType,
                price: Number(ticketType.price),
                totalSeats: Number(ticketType.totalSeats),
                bookedSeats: Number(ticketType.bookedSeats),
                availableSeats: Number(ticketType.totalSeats) - Number(ticketType.bookedSeats),
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getHostTicketTypes(req, res, next) {
        try {
            const { eventId } = req.params;
            const hostProfile = await prisma_1.prisma.hostProfile.findUnique({
                where: { userId: req.user.id },
            });
            if (!hostProfile) {
                throw new errors_1.BadRequestError('Host Profile not found.');
            }
            const event = await prisma_1.prisma.event.findUnique({
                where: { id: eventId },
            });
            if (!event) {
                return res.status(404).json({
                    success: false,
                    error: { message: 'Event not found.' },
                });
            }
            if (event.hostId !== hostProfile.id) {
                return res.status(403).json({
                    success: false,
                    error: { message: 'Access denied. You do not own this event.' },
                });
            }
            const ticketTypes = await prisma_1.prisma.eventTicketType.findMany({
                where: { eventId },
                orderBy: { createdAt: 'asc' },
            });
            const result = ticketTypes.map((tt) => ({
                id: tt.id,
                eventId: tt.eventId,
                name: tt.name,
                price: Number(tt.price),
                totalSeats: Number(tt.totalSeats),
                bookedSeats: Number(tt.bookedSeats),
                availableSeats: Number(tt.totalSeats) - Number(tt.bookedSeats),
                createdAt: tt.createdAt,
                updatedAt: tt.updatedAt,
            }));
            return api_response_1.ApiResponse.success(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    static async updateTicketType(req, res, next) {
        try {
            const { eventId, ticketTypeId } = req.params;
            const { name, price, totalSeats } = req.body;
            const hostProfile = await prisma_1.prisma.hostProfile.findUnique({
                where: { userId: req.user.id },
            });
            if (!hostProfile) {
                throw new errors_1.BadRequestError('Host Profile not found.');
            }
            const event = await prisma_1.prisma.event.findUnique({
                where: { id: eventId },
            });
            if (!event) {
                return res.status(404).json({
                    success: false,
                    error: { message: 'Event not found.' },
                });
            }
            if (event.hostId !== hostProfile.id) {
                return res.status(403).json({
                    success: false,
                    error: { message: 'Access denied. You do not own this event.' },
                });
            }
            const existingTicketType = await prisma_1.prisma.eventTicketType.findFirst({
                where: { id: ticketTypeId, eventId },
            });
            if (!existingTicketType) {
                return res.status(404).json({
                    success: false,
                    error: { message: 'Ticket type not found for this event.' },
                });
            }
            if (price !== undefined && (price === null || Number(price) < 0)) {
                throw new errors_1.BadRequestError('Price must be greater than or equal to 0.');
            }
            if (totalSeats !== undefined) {
                if (Number(totalSeats) <= 0) {
                    throw new errors_1.BadRequestError('Total seats must be greater than 0.');
                }
                if (Number(totalSeats) < existingTicketType.bookedSeats) {
                    throw new errors_1.BadRequestError(`Total seats (${totalSeats}) cannot be less than already booked seats (${existingTicketType.bookedSeats}).`);
                }
            }
            if (name && typeof name === 'string' && name.trim() !== existingTicketType.name) {
                const duplicate = await prisma_1.prisma.eventTicketType.findUnique({
                    where: {
                        eventId_name: {
                            eventId,
                            name: name.trim(),
                        },
                    },
                });
                if (duplicate) {
                    throw new errors_1.BadRequestError(`Ticket type with name "${name.trim()}" already exists for this event.`);
                }
            }
            const updated = await prisma_1.prisma.eventTicketType.update({
                where: { id: ticketTypeId },
                data: {
                    ...(name && typeof name === 'string' ? { name: name.trim() } : {}),
                    ...(price !== undefined ? { price: Number(price) } : {}),
                    ...(totalSeats !== undefined ? { totalSeats: Number(totalSeats) } : {}),
                },
            });
            return api_response_1.ApiResponse.success(res, {
                ...updated,
                price: Number(updated.price),
                totalSeats: Number(updated.totalSeats),
                bookedSeats: Number(updated.bookedSeats),
                availableSeats: Number(updated.totalSeats) - Number(updated.bookedSeats),
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async deleteTicketType(req, res, next) {
        try {
            const { eventId, ticketTypeId } = req.params;
            const hostProfile = await prisma_1.prisma.hostProfile.findUnique({
                where: { userId: req.user.id },
            });
            if (!hostProfile) {
                throw new errors_1.BadRequestError('Host Profile not found.');
            }
            const event = await prisma_1.prisma.event.findUnique({
                where: { id: eventId },
            });
            if (!event) {
                return res.status(404).json({
                    success: false,
                    error: { message: 'Event not found.' },
                });
            }
            if (event.hostId !== hostProfile.id) {
                return res.status(403).json({
                    success: false,
                    error: { message: 'Access denied. You do not own this event.' },
                });
            }
            const existingTicketType = await prisma_1.prisma.eventTicketType.findFirst({
                where: { id: ticketTypeId, eventId },
            });
            if (!existingTicketType) {
                return res.status(404).json({
                    success: false,
                    error: { message: 'Ticket type not found for this event.' },
                });
            }
            if (existingTicketType.bookedSeats > 0) {
                throw new errors_1.BadRequestError('Cannot delete ticket type that already has booked seats.');
            }
            await prisma_1.prisma.eventTicketType.delete({
                where: { id: ticketTypeId },
            });
            return api_response_1.ApiResponse.success(res, { message: 'Ticket type deleted successfully.' });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.EventsController = EventsController;
