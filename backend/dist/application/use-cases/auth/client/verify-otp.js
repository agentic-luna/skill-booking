"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientVerifyOtpCommandHandler = exports.ClientVerifyOtpCommand = void 0;
const errors_1 = require("../../../../api/common/errors");
class ClientVerifyOtpCommand {
    phone;
    otp;
    __tag = 'ClientVerifyOtpCommand';
    constructor(phone, otp) {
        this.phone = phone;
        this.otp = otp;
    }
}
exports.ClientVerifyOtpCommand = ClientVerifyOtpCommand;
class ClientVerifyOtpCommandHandler {
    cacheService;
    logger;
    constructor(cacheService, logger) {
        this.cacheService = cacheService;
        this.logger = logger;
    }
    async handle(command) {
        const { phone, otp } = command;
        if (!phone || !otp) {
            throw new errors_1.BadRequestError('WhatsApp / Mobile number and OTP code are required');
        }
        const normalizedPhone = phone.trim();
        const primaryKey = `otp:CLIENT_PHONE:${normalizedPhone}`;
        const fallbackKey = `otp:PHONE:${normalizedPhone}`;
        let cachedOtp = await this.cacheService.get(primaryKey);
        if (!cachedOtp) {
            cachedOtp = await this.cacheService.get(fallbackKey);
        }
        if (!cachedOtp) {
            throw new errors_1.BadRequestError('OTP has expired or was not requested');
        }
        if (cachedOtp !== otp.trim()) {
            throw new errors_1.BadRequestError('Invalid OTP code provided');
        }
        // Mark as verified for 15 minutes (900 seconds)
        const verifiedKeyPrimary = `otp:verified:CLIENT_PHONE:${normalizedPhone}`;
        const verifiedKeyFallback = `otp:verified:PHONE:${normalizedPhone}`;
        await this.cacheService.set(verifiedKeyPrimary, '1', 900);
        await this.cacheService.set(verifiedKeyFallback, '1', 900);
        // Delete active OTP keys
        await this.cacheService.del(primaryKey);
        await this.cacheService.del(fallbackKey);
        this.logger.info(`[ClientVerifyOtp] Verified OTP for client phone: ${normalizedPhone}`);
        return {
            success: true,
            message: 'WhatsApp / Phone number verified successfully',
        };
    }
}
exports.ClientVerifyOtpCommandHandler = ClientVerifyOtpCommandHandler;
