"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BoostEventCommandHandler = exports.BoostEventCommand = void 0;
const errors_1 = require("../../common/errors");
class BoostEventCommand {
    eventId;
    priority;
    startDate;
    endDate;
    isActive;
    __tag = 'BoostEventCommand';
    constructor(eventId, priority, startDate, endDate, isActive = true) {
        this.eventId = eventId;
        this.priority = priority;
        this.startDate = startDate;
        this.endDate = endDate;
        this.isActive = isActive;
    }
}
exports.BoostEventCommand = BoostEventCommand;
class BoostEventCommandHandler {
    boostedRepo;
    eventRepo;
    constructor(boostedRepo, eventRepo) {
        this.boostedRepo = boostedRepo;
        this.eventRepo = eventRepo;
    }
    async handle(command) {
        const { eventId, priority, startDate, endDate, isActive } = command;
        const event = await this.eventRepo.findById(eventId);
        if (!event) {
            throw new errors_1.NotFoundError('Event not found');
        }
        const start = startDate ? new Date(startDate) : new Date();
        const end = endDate ? new Date(endDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        return this.boostedRepo.upsert(eventId, {
            priority: Number(priority || 1),
            startDate: start,
            endDate: end,
            isActive: isActive !== undefined ? isActive : true,
        });
    }
}
exports.BoostEventCommandHandler = BoostEventCommandHandler;
