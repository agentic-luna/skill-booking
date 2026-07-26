"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientVerifyEmailMagicLinkCommandHandler = exports.ClientVerifyEmailMagicLinkCommand = void 0;
const errors_1 = require("../../../common/errors");
class ClientVerifyEmailMagicLinkCommand {
    token;
    __tag = 'ClientVerifyEmailMagicLinkCommand';
    constructor(token) {
        this.token = token;
    }
}
exports.ClientVerifyEmailMagicLinkCommand = ClientVerifyEmailMagicLinkCommand;
class ClientVerifyEmailMagicLinkCommandHandler {
    userRepo;
    cacheService;
    constructor(userRepo, cacheService) {
        this.userRepo = userRepo;
        this.cacheService = cacheService;
    }
    async handle(command) {
        const { token } = command;
        if (!token) {
            throw new errors_1.BadRequestError('Verification token is required');
        }
        const redisKey = `email_magic_link:${token}`;
        const rawPayload = await this.cacheService.get(redisKey);
        if (!rawPayload) {
            throw new errors_1.BadRequestError('Invalid or expired email verification link. Please request a new link.');
        }
        let payload;
        try {
            payload = typeof rawPayload === 'string' ? JSON.parse(rawPayload) : rawPayload;
        }
        catch {
            throw new errors_1.BadRequestError('Invalid magic link payload structure');
        }
        const { userId, email } = payload;
        const user = await this.userRepo.findById(userId);
        if (!user) {
            throw new errors_1.NotFoundError('User account not found');
        }
        // Update email and set isEmailVerified to true
        await this.userRepo.updateEmail(userId, email, true);
        // Delete token from Redis to prevent reuse
        await this.cacheService.del(redisKey);
        const fullProfile = await this.userRepo.findProfile(userId);
        return {
            message: 'Your email address has been verified successfully.',
            user: fullProfile,
        };
    }
}
exports.ClientVerifyEmailMagicLinkCommandHandler = ClientVerifyEmailMagicLinkCommandHandler;
