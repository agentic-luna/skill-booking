"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApproveEventCommandHandler = exports.ApproveEventCommand = void 0;
const client_1 = require("@prisma/client");
const errors_1 = require("../../common/errors");
class ApproveEventCommand {
    eventId;
    commissionType;
    platformValue;
    __tag = 'ApproveEventCommand';
    constructor(eventId, commissionType, platformValue) {
        this.eventId = eventId;
        this.commissionType = commissionType;
        this.platformValue = platformValue;
    }
}
exports.ApproveEventCommand = ApproveEventCommand;
class ApproveEventCommandHandler {
    eventRepo;
    cacheService;
    constructor(eventRepo, cacheService) {
        this.eventRepo = eventRepo;
        this.cacheService = cacheService;
    }
    async handle(command) {
        const { eventId, commissionType, platformValue } = command;
        const event = await this.eventRepo.findById(eventId);
        if (!event) {
            throw new errors_1.NotFoundError('Event not found');
        }
        const commission = await this.eventRepo.upsertCommission(eventId, commissionType, platformValue);
        const updatedEvent = await this.eventRepo.update(eventId, { status: client_1.EventStatus.APPROVED });
        // Clear event search cache
        await this.cacheService.delPattern('events:search:*');
        return { event: updatedEvent, commission };
    }
}
exports.ApproveEventCommandHandler = ApproveEventCommandHandler;
