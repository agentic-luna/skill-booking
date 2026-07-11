"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignupCommandHandler = exports.SignupCommand = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const environment_1 = require("../../../config/environment");
const system_roles_1 = require("../../../security/system.roles");
const errors_1 = require("../../common/errors");
class SignupCommand {
    data;
    __tag = 'SignupCommand';
    constructor(data) {
        this.data = data;
    }
}
exports.SignupCommand = SignupCommand;
class SignupCommandHandler {
    userRepo;
    cacheService;
    constructor(userRepo, cacheService) {
        this.userRepo = userRepo;
        this.cacheService = cacheService;
    }
    async handle(command) {
        const { data } = command;
        if (!data.email || !data.phone || !data.firstName || !data.lastName || !data.passwordText) {
            throw new errors_1.BadRequestError('First name, last name, email, phone, and password are required');
        }
        const normalizedEmail = data.email.toLowerCase().trim();
        const normalizedPhone = data.phone.trim();
        const existingEmail = await this.userRepo.findByEmail(normalizedEmail);
        if (existingEmail) {
            throw new errors_1.BadRequestError('Email is already registered');
        }
        const existingPhone = await this.userRepo.findByPhone(normalizedPhone);
        if (existingPhone) {
            throw new errors_1.BadRequestError('Phone number is already registered');
        }
        // 1. Verify Email OTP
        if (data.emailOtp) {
            const emailOtpKey = `otp:EMAIL:${normalizedEmail}`;
            const cachedOtp = await this.cacheService.get(emailOtpKey);
            if (!cachedOtp || cachedOtp !== data.emailOtp) {
                throw new errors_1.BadRequestError('Invalid or expired Email OTP');
            }
            await this.cacheService.del(emailOtpKey);
        }
        else {
            const emailVerifiedKey = `otp:verified:EMAIL:${normalizedEmail}`;
            const isEmailVerified = await this.cacheService.get(emailVerifiedKey);
            if (!isEmailVerified) {
                throw new errors_1.BadRequestError('Email OTP verification is required before completing signup');
            }
        }
        // 2. Verify Phone OTP
        if (data.phoneOtp) {
            const phoneOtpKey = `otp:PHONE:${normalizedPhone}`;
            const cachedOtp = await this.cacheService.get(phoneOtpKey);
            if (!cachedOtp || cachedOtp !== data.phoneOtp) {
                throw new errors_1.BadRequestError('Invalid or expired Phone OTP');
            }
            await this.cacheService.del(phoneOtpKey);
        }
        else {
            const phoneVerifiedKey = `otp:verified:PHONE:${normalizedPhone}`;
            const isPhoneVerified = await this.cacheService.get(phoneVerifiedKey);
            if (!isPhoneVerified) {
                throw new errors_1.BadRequestError('Phone OTP verification is required before completing signup');
            }
        }
        // Clean up Redis verification flags
        await this.cacheService.del(`otp:verified:EMAIL:${normalizedEmail}`);
        await this.cacheService.del(`otp:verified:PHONE:${normalizedPhone}`);
        const hashedPassword = await bcryptjs_1.default.hash(data.passwordText, 10);
        const userRole = data.role || client_1.UserRole.CLIENT;
        const user = await this.userRepo.create({
            firstName: data.firstName,
            lastName: data.lastName,
            email: normalizedEmail,
            phone: normalizedPhone,
            passwordHash: hashedPassword,
            role: userRole,
        });
        // Auto-create the appropriate profile based on role (1-1 relation)
        if (userRole === client_1.UserRole.CLIENT) {
            await this.userRepo.upsertClientProfile(user.id);
        }
        else if (userRole === client_1.UserRole.HOST) {
            // Create a stub HostProfile immediately so the 1-1 relation exists.
            // The host will later submit KYC details via POST /hosts/kyc which updates this record.
            await this.userRepo.upsertHostProfile(user.id, {
                kycStatus: client_1.KycStatus.PENDING,
            });
        }
        const permissions = (0, system_roles_1.getPermissionsForRole)(user.role);
        const accessToken = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role, permissions }, environment_1.env.JWT_SECRET, { expiresIn: '5d' });
        const refreshToken = jsonwebtoken_1.default.sign({ id: user.id }, environment_1.env.JWT_SECRET, { expiresIn: '7d' });
        const cacheKey = `auth:refresh_tokens:${user.id}:${refreshToken}`;
        await this.cacheService.set(cacheKey, '1', 7 * 24 * 60 * 60);
        return {
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                role: user.role,
                status: user.status,
            },
            accessToken,
            refreshToken,
        };
    }
}
exports.SignupCommandHandler = SignupCommandHandler;
