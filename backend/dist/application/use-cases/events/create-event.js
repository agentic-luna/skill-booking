"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateEventCommandHandler = exports.CreateEventCommand = void 0;
const client_1 = require("@prisma/client");
const errors_1 = require("../../common/errors");
class CreateEventCommand {
    userId;
    data;
    __tag = 'CreateEventCommand';
    constructor(userId, data) {
        this.userId = userId;
        this.data = data;
    }
}
exports.CreateEventCommand = CreateEventCommand;
class CreateEventCommandHandler {
    eventRepo;
    userRepo;
    cacheService;
    constructor(eventRepo, userRepo, cacheService) {
        this.eventRepo = eventRepo;
        this.userRepo = userRepo;
        this.cacheService = cacheService;
    }
    async handle(command) {
        const { userId, data } = command;
        const hostProfile = await this.userRepo.findHostProfileByUserId(userId);
        if (!hostProfile) {
            throw new errors_1.BadRequestError('Host Profile not found. Please complete KYC registration first.');
        }
        if (hostProfile.kycStatus !== client_1.KycStatus.APPROVED) {
            throw new errors_1.ForbiddenError('Cannot create events. Your KYC verification status is not APPROVED.');
        }
        const event = await this.eventRepo.create({
            hostId: hostProfile.id,
            title: data.title,
            posterUrl: data.posterUrl,
            mode: data.mode,
            venueDetails: data.venueDetails,
            startTime: new Date(data.startTime),
            totalSeats: data.totalSeats,
            availableSeats: data.totalSeats,
            status: client_1.EventStatus.PENDING,
            version: 1,
        });
        // Invalidate event listings caches
        await this.cacheService.delPattern('events:search:*');
        return event;
    }
}
exports.CreateEventCommandHandler = CreateEventCommandHandler;
