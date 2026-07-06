"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResetPasswordCommandHandler = exports.ResetPasswordCommand = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const errors_1 = require("../../common/errors");
class ResetPasswordCommand {
    resetToken;
    newPasswordText;
    __tag = 'ResetPasswordCommand';
    constructor(resetToken, newPasswordText) {
        this.resetToken = resetToken;
        this.newPasswordText = newPasswordText;
    }
}
exports.ResetPasswordCommand = ResetPasswordCommand;
class ResetPasswordCommandHandler {
    userRepo;
    cacheService;
    logger;
    constructor(userRepo, cacheService, logger) {
        this.userRepo = userRepo;
        this.cacheService = cacheService;
        this.logger = logger;
    }
    async handle(command) {
        const { resetToken, newPasswordText } = command;
        if (!resetToken || !newPasswordText) {
            throw new errors_1.BadRequestError('Reset token and new password are required');
        }
        if (newPasswordText.length < 6) {
            throw new errors_1.BadRequestError('Password must be at least 6 characters long');
        }
        const resetTokenKey = `forgot_pwd_token:${resetToken}`;
        const userId = await this.cacheService.get(resetTokenKey);
        if (!userId) {
            throw new errors_1.BadRequestError('Invalid or expired password reset token. Please request a new OTP.');
        }
        const user = await this.userRepo.findById(userId);
        if (!user || user.deletedAt) {
            throw new errors_1.NotFoundError('User account not found');
        }
        // Hash new password and update in DB
        const passwordHash = await bcryptjs_1.default.hash(newPasswordText, 10);
        await this.userRepo.updatePassword(user.id, passwordHash);
        // Invalidate the reset token
        await this.cacheService.del(resetTokenKey);
        this.logger.info(`[ResetPassword] Password successfully reset for user ${user.id}`);
        return {
            success: true,
            message: 'Your password has been reset successfully. You can now login with your new password.',
        };
    }
}
exports.ResetPasswordCommandHandler = ResetPasswordCommandHandler;
