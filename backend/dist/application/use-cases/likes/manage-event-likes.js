"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetUserLikedEventsQueryHandler = exports.GetUserLikedEventsQuery = exports.ToggleEventLikeCommandHandler = exports.ToggleEventLikeCommand = void 0;
const errors_1 = require("../../common/errors");
// 1. Toggle Like Event
class ToggleEventLikeCommand {
    clientId;
    eventId;
    __tag = 'ToggleEventLikeCommand';
    constructor(clientId, eventId) {
        this.clientId = clientId;
        this.eventId = eventId;
    }
}
exports.ToggleEventLikeCommand = ToggleEventLikeCommand;
class ToggleEventLikeCommandHandler {
    likeRepo;
    eventRepo;
    constructor(likeRepo, eventRepo) {
        this.likeRepo = likeRepo;
        this.eventRepo = eventRepo;
    }
    async handle(command) {
        const { clientId, eventId } = command;
        if (!eventId)
            throw new errors_1.BadRequestError('Event ID is required');
        const event = await this.eventRepo.findById(eventId);
        if (!event)
            throw new errors_1.NotFoundError('Event not found');
        const result = await this.likeRepo.toggleLike(clientId, eventId);
        const totalLikes = await this.likeRepo.getLikeCountForEvent(eventId);
        return {
            success: true,
            liked: result.liked,
            totalLikes,
            like: result.like,
        };
    }
}
exports.ToggleEventLikeCommandHandler = ToggleEventLikeCommandHandler;
// 2. Get User Liked Events
class GetUserLikedEventsQuery {
    clientId;
    __tag = 'GetUserLikedEventsQuery';
    constructor(clientId) {
        this.clientId = clientId;
    }
}
exports.GetUserLikedEventsQuery = GetUserLikedEventsQuery;
class GetUserLikedEventsQueryHandler {
    likeRepo;
    constructor(likeRepo) {
        this.likeRepo = likeRepo;
    }
    async handle(query) {
        const likes = await this.likeRepo.findByClient(query.clientId);
        return { likes, count: likes.length };
    }
}
exports.GetUserLikedEventsQueryHandler = GetUserLikedEventsQueryHandler;
