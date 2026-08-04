"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientSendEmailVerificationCommandHandler = exports.ClientSendEmailVerificationCommand = void 0;
const crypto_1 = __importDefault(require("crypto"));
const errors_1 = require("../../../common/errors");
const client_1 = require("@prisma/client");
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
        // Send magic link email via provider using database templates
        try {
            const templates = await this.configRepo.findTemplates({
                triggerEvent: client_1.TriggerEvent.EMAIL_VERIFICATION,
                isActive: true,
            });
            const emailTemplate = templates.find((t) => t.channel === client_1.DeliveryChannel.EMAIL);
            let subject = 'Verify Your Email Address — BookMySkill';
            let emailBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px;">
          <h2 style="color: #0b0c01; margin-bottom: 8px;">Verify Your Email Address</h2>
          <p style="color: #555; font-size: 14px;">Hi ${currentUser.firstName},</p>
          <p style="color: #555; font-size: 14px;">Click the button below to verify your email address and link it to your BookMySkill account:</p>
          <div style="margin: 24px 0;">
            <a href="${magicLink}" style="background-color: #a0f212; color: #0b0c01; font-weight: bold; text-decoration: none; padding: 12px 24px; border-radius: 8px; display: inline-block;">Verify Email Address</a>
          </div>
          <p style="color: #888; font-size: 12px; margin-top: 16px;">Or copy and paste this link in your browser:<br/><a href="${magicLink}">${magicLink}</a></p>
          <p style="color: #aaa; font-size: 11px; margin-top: 24px;">This link will expire in 15 minutes.</p>
        </div>
      `;
            if (emailTemplate) {
                subject = emailTemplate.subject || subject;
                emailBody = emailTemplate.bodyContent
                    .replace(/\{\{userName\}\}/g, currentUser.firstName)
                    .replace(/\{\{magicLink\}\}/g, magicLink);
            }
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
