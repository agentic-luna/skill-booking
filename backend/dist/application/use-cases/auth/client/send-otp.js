"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientSendOtpCommandHandler = exports.ClientSendOtpCommand = void 0;
const errors_1 = require("../../../../api/common/errors");
class ClientSendOtpCommand {
    phone;
    __tag = 'ClientSendOtpCommand';
    constructor(phone) {
        this.phone = phone;
    }
}
exports.ClientSendOtpCommand = ClientSendOtpCommand;
class ClientSendOtpCommandHandler {
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
        const { phone } = command;
        if (!phone || typeof phone !== 'string' || !phone.trim()) {
            throw new errors_1.BadRequestError('WhatsApp / Mobile number is required');
        }
        const normalizedPhone = phone.trim();
        // Check rate limit: Maximum 3 OTP requests per hour (3600s)
        const rateLimitKey = `otp_rate_limit:${normalizedPhone}`;
        const currentCountVal = await this.cacheService.get(rateLimitKey);
        const currentCount = currentCountVal ? Number(currentCountVal) : 0;
        if (currentCount >= 3) {
            throw new errors_1.TooManyRequestsError('Maximum OTP request limit reached (3 OTPs per hour). Please try again after 1 hour.');
        }
        // Check if phone number is already registered
        const existing = await this.userRepo.findByPhone(normalizedPhone);
        if (existing) {
            throw new errors_1.BadRequestError('Phone number is already registered');
        }
        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        // Cache in Redis for 10 minutes (600s)
        const cacheKey = `otp:CLIENT_PHONE:${normalizedPhone}`;
        const fallbackCacheKey = `otp:PHONE:${normalizedPhone}`;
        await this.cacheService.set(cacheKey, otp, 600);
        await this.cacheService.set(fallbackCacheKey, otp, 600);
        await this.cacheService.set(rateLimitKey, currentCount + 1, 3600);
        // Send via communication service (SMS/WhatsApp)
        await this.commsService.sendSMS(normalizedPhone, `Your Client registration OTP is: ${otp}. Valid for 10 minutes.`);
        this.logger.info(`[ClientSendOtp] Sent registration OTP to ${normalizedPhone}`);
        return {
            success: true,
            message: 'OTP sent successfully to WhatsApp / mobile number',
            expiresInSeconds: 600,
            ...(process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test' ? { devOtp: otp } : {}),
        };
    }
}
exports.ClientSendOtpCommandHandler = ClientSendOtpCommandHandler;
