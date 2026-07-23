"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientSignupCommandHandler = exports.ClientSignupCommand = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const environment_1 = require("../../../../config/environment");
const system_roles_1 = require("../../../../security/system.roles");
const errors_1 = require("../../../common/errors");
class ClientSignupCommand {
    data;
    __tag = 'ClientSignupCommand';
    constructor(data) {
        this.data = data;
    }
}
exports.ClientSignupCommand = ClientSignupCommand;
class ClientSignupCommandHandler {
    userRepo;
    cacheService;
    constructor(userRepo, cacheService) {
        this.userRepo = userRepo;
        this.cacheService = cacheService;
    }
    async handle(command) {
        const { data } = command;
        if (!data.firstName || !data.lastName || !data.phone || !data.passwordText) {
            throw new errors_1.BadRequestError('First name, last name, WhatsApp / mobile number, and password are required');
        }
        const normalizedPhone = data.phone.trim();
        const existingPhone = await this.userRepo.findByPhone(normalizedPhone);
        if (existingPhone) {
            throw new errors_1.BadRequestError('Phone number is already registered');
        }
        // Verify WhatsApp / Phone OTP
        if (data.otp) {
            const primaryOtpKey = `otp:CLIENT_PHONE:${normalizedPhone}`;
            const fallbackOtpKey = `otp:PHONE:${normalizedPhone}`;
            let cachedOtp = await this.cacheService.get(primaryOtpKey);
            if (!cachedOtp) {
                cachedOtp = await this.cacheService.get(fallbackOtpKey);
            }
            if (!cachedOtp || cachedOtp !== data.otp.trim()) {
                throw new errors_1.BadRequestError('Invalid or expired OTP code');
            }
            await this.cacheService.del(primaryOtpKey);
            await this.cacheService.del(fallbackOtpKey);
        }
        else {
            const primaryVerifiedKey = `otp:verified:CLIENT_PHONE:${normalizedPhone}`;
            const fallbackVerifiedKey = `otp:verified:PHONE:${normalizedPhone}`;
            const isVerifiedPrimary = await this.cacheService.get(primaryVerifiedKey);
            const isVerifiedFallback = await this.cacheService.get(fallbackVerifiedKey);
            if (!isVerifiedPrimary && !isVerifiedFallback) {
                throw new errors_1.BadRequestError('WhatsApp / Phone OTP verification is required before completing signup');
            }
        }
        // Clean up Redis verification flags
        await this.cacheService.del(`otp:verified:CLIENT_PHONE:${normalizedPhone}`);
        await this.cacheService.del(`otp:verified:PHONE:${normalizedPhone}`);
        const hashedPassword = await bcryptjs_1.default.hash(data.passwordText, 10);
        // Create client user without email requirement
        const user = await this.userRepo.create({
            firstName: data.firstName.trim(),
            lastName: data.lastName.trim(),
            phone: normalizedPhone,
            email: null,
            passwordHash: hashedPassword,
            role: client_1.UserRole.CLIENT,
        });
        // Auto-create Client Profile (1-1 relation)
        await this.userRepo.upsertClientProfile(user.id);
        const permissions = (0, system_roles_1.getPermissionsForRole)(user.role);
        const accessToken = jsonwebtoken_1.default.sign({ id: user.id, email: user.email || null, role: user.role, permissions }, environment_1.env.JWT_SECRET, { expiresIn: '5d' });
        const refreshToken = jsonwebtoken_1.default.sign({ id: user.id }, environment_1.env.JWT_SECRET, { expiresIn: '7d' });
        const cacheKey = `auth:refresh_tokens:${user.id}:${refreshToken}`;
        await this.cacheService.set(cacheKey, '1', 7 * 24 * 60 * 60);
        const fullProfile = await this.userRepo.findProfile(user.id);
        return {
            user: fullProfile,
            accessToken,
            refreshToken,
        };
    }
}
exports.ClientSignupCommandHandler = ClientSignupCommandHandler;
