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
        // Validate ticket types if provided
        if (data.ticketTypes && Array.isArray(data.ticketTypes) && data.ticketTypes.length > 0) {
            if (data.ticketTypes.length > 10) {
                throw new errors_1.BadRequestError('An event can have a maximum of 10 ticket types.');
            }
            const namesSet = new Set();
            for (const tt of data.ticketTypes) {
                if (!tt.name || typeof tt.name !== 'string' || tt.name.trim() === '') {
                    throw new errors_1.BadRequestError('Ticket type name is required.');
                }
                if (tt.price === undefined || tt.price === null || Number(tt.price) < 0) {
                    throw new errors_1.BadRequestError(`Invalid price for ticket type "${tt.name}". Price must be >= 0.`);
                }
                if (!tt.totalSeats || Number(tt.totalSeats) <= 0) {
                    throw new errors_1.BadRequestError(`Invalid total seats for ticket type "${tt.name}". Total seats must be > 0.`);
                }
                const normalizedName = tt.name.trim().toLowerCase();
                if (namesSet.has(normalizedName)) {
                    throw new errors_1.BadRequestError(`Duplicate ticket type name "${tt.name}" is not allowed.`);
                }
                namesSet.add(normalizedName);
            }
        }
        let totalSeats = Number(data.totalSeats) || 0;
        let basePrice = data.price !== undefined ? Number(data.price) : undefined;
        if (data.ticketTypes && Array.isArray(data.ticketTypes) && data.ticketTypes.length > 0) {
            const sumSeats = data.ticketTypes.reduce((acc, tt) => acc + Number(tt.totalSeats || 0), 0);
            if (!totalSeats || totalSeats <= 0) {
                totalSeats = sumSeats;
            }
            if (basePrice === undefined) {
                basePrice = Math.min(...data.ticketTypes.map(tt => Number(tt.price)));
            }
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
            totalSeats: totalSeats,
            availableSeats: totalSeats,
            status: client_1.EventStatus.PENDING,
            version: 1,
            price: basePrice,
            duration: data.duration,
            durationHours,
            description: data.description,
            category: data.category,
            keywords: data.keywords || [],
            videoUrls: data.videoUrls || [],
            ticketTypes: data.ticketTypes ? data.ticketTypes.map(tt => ({
                name: tt.name.trim(),
                price: Number(tt.price),
                totalSeats: Number(tt.totalSeats),
            })) : undefined,
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
