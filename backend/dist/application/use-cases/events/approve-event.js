"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApproveEventCommandHandler = exports.ApproveEventCommand = void 0;
const client_1 = require("@prisma/client");
const errors_1 = require("../../common/errors");
const commission_parser_1 = require("../../../utils/commission-parser");
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
    configRepo;
    constructor(eventRepo, cacheService, configRepo) {
        this.eventRepo = eventRepo;
        this.cacheService = cacheService;
        this.configRepo = configRepo;
    }
    async handle(command) {
        const { eventId, commissionType, platformValue } = command;
        const event = await this.eventRepo.findById(eventId);
        if (!event) {
            throw new errors_1.NotFoundError('Event not found');
        }
        let finalType;
        let finalValue;
        if (commissionType && platformValue !== undefined && platformValue !== null && !isNaN(platformValue)) {
            finalType = commissionType;
            finalValue = platformValue;
        }
        else {
            try {
                const setting = await this.configRepo.findPlatformSetting('commissionRate');
                const parsed = (0, commission_parser_1.parseCommissionRate)(setting?.value);
                finalType = parsed.commissionType;
                finalValue = parsed.platformValue;
            }
            catch (err) {
                finalType = client_1.CommissionType.PERCENTAGE;
                finalValue = 15;
            }
        }
        const commission = await this.eventRepo.upsertCommission(eventId, finalType, finalValue);
        const updatedEvent = await this.eventRepo.update(eventId, { status: client_1.EventStatus.APPROVED });
        // Clear event search cache
        await this.cacheService.delPattern('events:search:*');
        return { event: updatedEvent, commission };
    }
}
exports.ApproveEventCommandHandler = ApproveEventCommandHandler;
