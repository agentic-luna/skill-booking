"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientSendEmailVerificationCommandHandler = exports.ClientSendEmailVerificationCommand = void 0;
const crypto_1 = __importDefault(require("crypto"));
const errors_1 = require("../../../common/errors");
const templates_1 = require("../../../../constants/templates");
class ClientSendEmailVerificationCommand {
    userId;
    email;
    __tag = 'ClientSendEmailVerificationCommand';
    constructor(userId, email) {
        this.userId = userId;
        this.email = email;
    }
}
exports.ClientSendEmailVerificationCommand = ClientSendEmailVerificationCommand;
class ClientSendEmailVerificationCommandHandler {
    userRepo;
    cacheService;
    emailProvider;
    configRepo;
    constructor(userRepo, cacheService, emailProvider, configRepo) {
        this.userRepo = userRepo;
        this.cacheService = cacheService;
        this.emailProvider = emailProvider;
        this.configRepo = configRepo;
    }
    async handle(command) {
        const { userId, email } = command;
        if (!email || !email.includes('@')) {
            throw new errors_1.BadRequestError('A valid email address is required');
        }
        const cleanEmail = email.toLowerCase().trim();
        // Check if email belongs to someone else
        const existingUser = await this.userRepo.findByEmail(cleanEmail);
        if (existingUser && existingUser.id !== userId) {
            throw new errors_1.BadRequestError('This email address is already registered to another account');
        }
        const currentUser = await this.userRepo.findById(userId);
        if (!currentUser) {
            throw new errors_1.NotFoundError('User account not found');
        }
        // Generate secure 32-byte hex token
        const token = crypto_1.default.randomBytes(32).toString('hex');
        const redisKey = `email_magic_link:${token}`;
        const payload = JSON.stringify({ userId, email: cleanEmail });
        // Store in Redis with 15-minute TTL (900 seconds)
        await this.cacheService.set(redisKey, payload, 900);
        const clientAppUrl = process.env.CLIENT_APP_URL || 'http://localhost:3000';
        const magicLink = `${clientAppUrl}/verify-email?token=${token}`;
        // Send magic link email via provider using template
        try {
            const subject = 'Verify Your Email Address — BookMyTraining';
            const emailBody = (0, templates_1.generateClientMagicLinkTemplate)({
                userName: currentUser.firstName,
                magicLink,
                expiresInMinutes: 15,
            });
            if (this.emailProvider && typeof this.emailProvider.sendEmail === 'function') {
                await this.emailProvider.sendEmail(cleanEmail, subject, emailBody);
            }
        }
        catch (err) {
            console.warn('Failed to dispatch magic link email:', err);
        }
        return {
            message: `Magic verification link dispatched to ${cleanEmail}. Please check your inbox.`,
            magicLink,
            token,
        };
    }
}
exports.ClientSendEmailVerificationCommandHandler = ClientSendEmailVerificationCommandHandler;
