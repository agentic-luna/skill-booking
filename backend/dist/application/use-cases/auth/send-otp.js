"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendOtpCommandHandler = exports.SendOtpCommand = void 0;
const client_1 = require("@prisma/client");
const errors_1 = require("../../../api/common/errors");
class SendOtpCommand {
    target;
    type;
    __tag = 'SendOtpCommand';
    constructor(target, type) {
        this.target = target;
        this.type = type;
    }
}
exports.SendOtpCommand = SendOtpCommand;
class SendOtpCommandHandler {
    cacheService;
    commsService;
    userRepo;
    logger;
    constructor(cacheService, commsService, userRepo, logger) {
        this.cacheService = cacheService;
        this.commsService = commsService;
        this.userRepo = userRepo;
        this.logger = logger;
    }
    async handle(command) {
        const { target, type } = command;
        if (!target || !type) {
            throw new errors_1.BadRequestError('Target and type (EMAIL or PHONE/SMS) are required');
        }
        const normalizedType = type === client_1.DeliveryChannel.EMAIL ? client_1.DeliveryChannel.EMAIL : client_1.DeliveryChannel.SMS;
        // Normalize target: lowercase for email, trim for phone
        const normalizedTarget = normalizedType === client_1.DeliveryChannel.EMAIL
            ? target.toLowerCase().trim()
            : target.trim();
        // Check rate limit: Maximum 3 OTP requests per hour (3600s)
        const rateLimitKey = `otp_rate_limit:${normalizedTarget}`;
        const currentCountVal = await this.cacheService.get(rateLimitKey);
        const currentCount = currentCountVal ? Number(currentCountVal) : 0;
        if (currentCount >= 3) {
            throw new errors_1.TooManyRequestsError('Maximum OTP request limit reached (3 OTPs per hour). Please try again after 1 hour.');
        }
        if (normalizedType === client_1.DeliveryChannel.EMAIL) {
            const existing = await this.userRepo.findByEmail(normalizedTarget);
            if (existing) {
                throw new errors_1.BadRequestError('Email is already registered');
            }
        }
        else {
            const existing = await this.userRepo.findByPhone(normalizedTarget);
            if (existing) {
                throw new errors_1.BadRequestError('Phone number is already registered');
            }
        }
        // Generate secure 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        // Cache in Redis for 10 minutes (600s)
        const typeKey = normalizedType === client_1.DeliveryChannel.EMAIL ? 'EMAIL' : 'PHONE';
        const cacheKey = `otp:${typeKey}:${normalizedTarget}`;
        await this.cacheService.set(cacheKey, otp, 600);
        await this.cacheService.set(rateLimitKey, currentCount + 1, 3600);
        // Send via provider
        if (normalizedType === client_1.DeliveryChannel.EMAIL) {
            await this.commsService.sendEmail(normalizedTarget, 'Your Registration Verification OTP', `Your OTP for registration verification is: ${otp}. It is valid for 10 minutes.`);
        }
        else {
            await this.commsService.sendSMS(normalizedTarget, `Your registration OTP is: ${otp}. Valid for 10 minutes.`);
        }
        this.logger.info(`[SendOtp] Sent OTP for ${normalizedType} to ${normalizedTarget}`);
        return {
            success: true,
            message: `OTP sent successfully to ${normalizedType.toLowerCase()}`,
            expiresInSeconds: 600,
            ...(process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test' ? { devOtp: otp } : {}),
        };
    }
}
exports.SendOtpCommandHandler = SendOtpCommandHandler;
