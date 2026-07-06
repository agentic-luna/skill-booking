"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerifyForgotPasswordOtpCommandHandler = exports.VerifyForgotPasswordOtpCommand = void 0;
const crypto_1 = __importDefault(require("crypto"));
const errors_1 = require("../../common/errors");
class VerifyForgotPasswordOtpCommand {
    identifier;
    otp;
    __tag = 'VerifyForgotPasswordOtpCommand';
    constructor(identifier, otp) {
        this.identifier = identifier;
        this.otp = otp;
    }
}
exports.VerifyForgotPasswordOtpCommand = VerifyForgotPasswordOtpCommand;
class VerifyForgotPasswordOtpCommandHandler {
    userRepo;
    cacheService;
    logger;
    constructor(userRepo, cacheService, logger) {
        this.userRepo = userRepo;
        this.cacheService = cacheService;
        this.logger = logger;
    }
    async handle(command) {
        const { identifier, otp } = command;
        if (!identifier || !otp) {
            throw new errors_1.BadRequestError('Email/mobile number and OTP are required');
        }
        let user = await this.userRepo.findByEmail(identifier);
        if (!user) {
            user = await this.userRepo.findByPhone(identifier);
        }
        if (!user || user.deletedAt) {
            throw new errors_1.NotFoundError('User account not found');
        }
        const cacheKey = `forgot_pwd_otp:${user.id}`;
        const cachedOtp = await this.cacheService.get(cacheKey);
        if (!cachedOtp || cachedOtp !== otp.trim()) {
            throw new errors_1.BadRequestError('Invalid or expired OTP');
        }
        // OTP is valid! Clear the OTP key
        await this.cacheService.del(cacheKey);
        // Generate a secure resetToken (15 minute TTL)
        const resetToken = crypto_1.default.randomBytes(32).toString('hex');
        const resetTokenKey = `forgot_pwd_token:${resetToken}`;
        await this.cacheService.set(resetTokenKey, user.id, 900); // 15 mins
        this.logger.info(`[VerifyForgotPasswordOtp] OTP verified successfully for user ${user.id}`);
        return {
            success: true,
            message: 'OTP verified successfully. You can now reset your password.',
            resetToken,
            expiresInSeconds: 900,
        };
    }
}
exports.VerifyForgotPasswordOtpCommandHandler = VerifyForgotPasswordOtpCommandHandler;
