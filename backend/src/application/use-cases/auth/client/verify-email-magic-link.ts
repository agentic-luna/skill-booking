import { IUserRepository } from '../../../../domain/repositories/user.repository';
import { ICacheService } from '../../../services/cache.service';
import { IRequest, IRequestHandler } from '../../../common/mediator';
import { BadRequestError, NotFoundError } from '../../../common/errors';

export class ClientVerifyEmailMagicLinkCommand implements IRequest<any> {
  readonly __tag = 'ClientVerifyEmailMagicLinkCommand';
  constructor(public readonly token: string) {}
}

export class ClientVerifyEmailMagicLinkCommandHandler implements IRequestHandler<ClientVerifyEmailMagicLinkCommand, any> {
  constructor(
    private userRepo: IUserRepository,
    private cacheService: ICacheService
  ) {}

  async handle(command: ClientVerifyEmailMagicLinkCommand): Promise<{ message: string; user: any }> {
    const { token } = command;

    if (!token) {
      throw new BadRequestError('Verification token is required');
    }

    const redisKey = `email_magic_link:${token}`;
    const rawPayload = await this.cacheService.get<string>(redisKey);

    if (!rawPayload) {
      throw new BadRequestError('Invalid or expired email verification link. Please request a new link.');
    }

    let payload: { userId: string; email: string };
    try {
      payload = typeof rawPayload === 'string' ? JSON.parse(rawPayload) : rawPayload;
    } catch {
      throw new BadRequestError('Invalid magic link payload structure');
    }

    const { userId, email } = payload;

    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundError('User account not found');
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
