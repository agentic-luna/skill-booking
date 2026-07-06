"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerifyOtpCommandHandler = exports.VerifyOtpCommand = void 0;
const errors_1 = require("../../../api/common/errors");
class VerifyOtpCommand {
    target;
    type;
    otp;
    __tag = 'VerifyOtpCommand';
    constructor(target, type, otp) {
        this.target = target;
        this.type = type;
        this.otp = otp;
    }
}
exports.VerifyOtpCommand = VerifyOtpCommand;
class VerifyOtpCommandHandler {
    cacheService;
    logger;
    constructor(cacheService, logger) {
        this.cacheService = cacheService;
        this.logger = logger;
    }
    async handle(command) {
        const { target, type, otp } = command;
        if (!target || !type || !otp) {
            throw new errors_1.BadRequestError('Target, type (EMAIL or PHONE/SMS), and OTP code are required');
        }
        const typeKey = (type === 'EMAIL' || type === 'EMAIL') ? 'EMAIL' : 'PHONE';
        const cacheKey = `otp:${typeKey}:${target}`;
        const cachedOtp = await this.cacheService.get(cacheKey);
        if (!cachedOtp) {
            throw new errors_1.BadRequestError('OTP has expired or was not requested');
        }
        if (cachedOtp !== otp) {
            throw new errors_1.BadRequestError('Invalid OTP code provided');
        }
        // Mark as verified for 15 minutes (900 seconds)
        const verifiedKey = `otp:verified:${typeKey}:${target}`;
        await this.cacheService.set(verifiedKey, '1', 900);
        // Delete active OTP
        await this.cacheService.del(cacheKey);
        this.logger.info(`[VerifyOtp] Verified OTP for ${typeKey} target: ${target}`);
        return {
            success: true,
            message: `${typeKey} verified successfully`,
        };
    }
}
exports.VerifyOtpCommandHandler = VerifyOtpCommandHandler;
