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
        const existingEmail = await this.userRepo.findByEmail(data.email);
        if (existingEmail) {
            throw new errors_1.BadRequestError('Email is already registered');
        }
        const existingPhone = await this.userRepo.findByPhone(data.phone);
        if (existingPhone) {
            throw new errors_1.BadRequestError('Phone number is already registered');
        }
        // 1. Verify Email OTP
        if (data.emailOtp) {
            const emailOtpKey = `otp:EMAIL:${data.email}`;
            const cachedOtp = await this.cacheService.get(emailOtpKey);
            if (!cachedOtp || cachedOtp !== data.emailOtp) {
                throw new errors_1.BadRequestError('Invalid or expired Email OTP');
            }
            await this.cacheService.del(emailOtpKey);
        }
        else {
            const emailVerifiedKey = `otp:verified:EMAIL:${data.email}`;
            const isEmailVerified = await this.cacheService.get(emailVerifiedKey);
            if (!isEmailVerified) {
                throw new errors_1.BadRequestError('Email OTP verification is required before completing signup');
            }
        }
        // 2. Verify Phone OTP
        if (data.phoneOtp) {
            const phoneOtpKey = `otp:PHONE:${data.phone}`;
            const cachedOtp = await this.cacheService.get(phoneOtpKey);
            if (!cachedOtp || cachedOtp !== data.phoneOtp) {
                throw new errors_1.BadRequestError('Invalid or expired Phone OTP');
            }
            await this.cacheService.del(phoneOtpKey);
        }
        else {
            const phoneVerifiedKey = `otp:verified:PHONE:${data.phone}`;
            const isPhoneVerified = await this.cacheService.get(phoneVerifiedKey);
            if (!isPhoneVerified) {
                throw new errors_1.BadRequestError('Phone OTP verification is required before completing signup');
            }
        }
        // Clean up Redis verification flags
        await this.cacheService.del(`otp:verified:EMAIL:${data.email}`);
        await this.cacheService.del(`otp:verified:PHONE:${data.phone}`);
        const hashedPassword = await bcryptjs_1.default.hash(data.passwordText, 10);
        const user = await this.userRepo.create({
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone,
            passwordHash: hashedPassword,
            role: data.role || client_1.UserRole.CLIENT,
        });
        const accessToken = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, environment_1.env.JWT_SECRET, { expiresIn: '15m' });
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
