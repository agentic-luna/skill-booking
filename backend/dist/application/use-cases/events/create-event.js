"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateEventCommandHandler = exports.CreateEventCommand = void 0;
const client_1 = require("@prisma/client");
const errors_1 = require("../../common/errors");
const duration_parser_1 = require("../../../utils/duration-parser");
const commission_parser_1 = require("../../../utils/commission-parser");
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
    configRepo;
    constructor(eventRepo, userRepo, cacheService, configRepo) {
        this.eventRepo = eventRepo;
        this.userRepo = userRepo;
        this.cacheService = cacheService;
        this.configRepo = configRepo;
    }
    async handle(command) {
        const { userId, data } = command;
        const hostProfile = await this.userRepo.findHostProfileByUserId(userId);
        if (!hostProfile) {
            throw new errors_1.BadRequestError('Host profile not found. Please contact support.');
        }
        if (!hostProfile.govIdUrl) {
            throw new errors_1.ForbiddenError('Cannot create events. Please submit your KYC documents first via the /hosts/kyc endpoint.');
        }
        if (hostProfile.kycStatus !== client_1.KycStatus.APPROVED) {
            throw new errors_1.ForbiddenError('Cannot create events. Your KYC verification is ' + hostProfile.kycStatus + '. Please wait for admin approval.');
        }
        const durationHours = (0, duration_parser_1.parseDurationToHours)(data.duration);
        // Retrieve initial commission based on Platform Settings commissionRate
        let commissionType = client_1.CommissionType.PERCENTAGE;
        let platformValue = 15;
        try {
            const setting = await this.configRepo.findPlatformSetting('commissionRate');
            const parsed = (0, commission_parser_1.parseCommissionRate)(setting?.value);
            commissionType = parsed.commissionType;
            platformValue = parsed.platformValue;
        }
        catch (err) {
            // Default fallback in case of errors
        }
        const event = await this.eventRepo.create({
            hostId: hostProfile.id,
            title: data.title,
            posterUrl: data.posterUrl || '', // default to empty string if not provided
            images: data.images || [],
            mode: data.mode,
            venue: data.venue,
            instructor: data.instructor,
            startTime: new Date(data.startTime),
            totalSeats: data.totalSeats,
            availableSeats: data.totalSeats,
            status: client_1.EventStatus.PENDING,
            version: 1,
            price: data.price,
            duration: data.duration,
            durationHours,
            description: data.description,
            category: data.category,
            keywords: data.keywords || [],
            videoUrls: data.videoUrls || [],
            venueDetails: {
                district: data.venue?.district || undefined,
                endDate: data.venue?.endDate || undefined,
            },
            commissionType,
            platformValue,
        });
        // Invalidate event listings caches
        await this.cacheService.delPattern('events:search:*');
        return event;
    }
}
exports.CreateEventCommandHandler = CreateEventCommandHandler;
