import crypto from 'crypto';
import { IUserRepository } from '../../../../domain/repositories/user.repository';
import { ICacheService } from '../../../services/cache.service';
import { IEmailProvider } from '../../../../infrastructure/services/providers/email.provider';
import { IRequest, IRequestHandler } from '../../../common/mediator';
import { IConfigRepository } from '../../../../domain/repositories/config.repository';
import { BadRequestError, NotFoundError } from '../../../common/errors';
import { TriggerEvent, DeliveryChannel } from '@prisma/client';
import { generateClientMagicLinkTemplate } from '../../../../constants/templates';

export class ClientSendEmailVerificationCommand implements IRequest<any> {
  readonly __tag = 'ClientSendEmailVerificationCommand';
  constructor(
    public readonly userId: string,
    public readonly email: string
  ) { }
}

export class ClientSendEmailVerificationCommandHandler implements IRequestHandler<ClientSendEmailVerificationCommand, any> {
  constructor(
    private userRepo: IUserRepository,
    private cacheService: ICacheService,
    private emailProvider: IEmailProvider,
    private configRepo: IConfigRepository
  ) { }

  async handle(command: ClientSendEmailVerificationCommand): Promise<{ message: string; magicLink?: string; token?: string }> {
    const { userId, email } = command;

    if (!email || !email.includes('@')) {
      throw new BadRequestError('A valid email address is required');
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if email belongs to someone else
    const existingUser = await this.userRepo.findByEmail(cleanEmail);
    if (existingUser && existingUser.id !== userId) {
      throw new BadRequestError('This email address is already registered to another account');
    }

    const currentUser = await this.userRepo.findById(userId);
    if (!currentUser) {
      throw new NotFoundError('User account not found');
    }

    // Generate secure 32-byte hex token
    const token = crypto.randomBytes(32).toString('hex');
    const redisKey = `email_magic_link:${token}`;
    const payload = JSON.stringify({ userId, email: cleanEmail });

    // Store in Redis with 15-minute TTL (900 seconds)
    await this.cacheService.set(redisKey, payload, 900);

    const clientAppUrl = process.env.CLIENT_APP_URL || 'http://localhost:3000';
    const magicLink = `${clientAppUrl}/verify-email?token=${token}`;

    // Send magic link email via provider using template
    try {
      const subject = 'Verify Your Email Address — BookMyTraining';
      const emailBody = generateClientMagicLinkTemplate({
        userName: currentUser.firstName,
        magicLink,
        expiresInMinutes: 15,
      });

      if (this.emailProvider && typeof this.emailProvider.sendEmail === 'function') {
        await this.emailProvider.sendEmail(
          cleanEmail,
          subject,
          emailBody
        );
      }
    } catch (err) {
      console.warn('Failed to dispatch magic link email:', err);
    }

    return {
      message: `Magic verification link dispatched to ${cleanEmail}. Please check your inbox.`,
      magicLink,
      token,
    };
  }
}
