"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetEventDetailsQueryHandler = exports.GetEventDetailsQuery = void 0;
const errors_1 = require("../../common/errors");
class GetEventDetailsQuery {
    eventId;
    __tag = 'GetEventDetailsQuery';
    constructor(eventId) {
        this.eventId = eventId;
    }
}
exports.GetEventDetailsQuery = GetEventDetailsQuery;
class GetEventDetailsQueryHandler {
    eventRepo;
    constructor(eventRepo) {
        this.eventRepo = eventRepo;
    }
    async handle(query) {
        const { eventId } = query;
        const event = await this.eventRepo.findById(eventId);
        if (!event) {
            throw new errors_1.NotFoundError('Event not found');
        }
        return event;
    }
}
exports.GetEventDetailsQueryHandler = GetEventDetailsQueryHandler;
