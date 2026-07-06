import crypto from 'crypto';
import { IRequest, IRequestHandler } from '../../common/mediator';
import { IUserRepository } from '../../../domain/repositories/user.repository';
import { ICacheService } from '../../services/cache.service';
import { ILoggerService } from '../../services/logger.service';
import { BadRequestError, NotFoundError } from '../../common/errors';

export class VerifyForgotPasswordOtpCommand implements IRequest<any> {
  readonly __tag = 'VerifyForgotPasswordOtpCommand';
  constructor(
    public readonly identifier: string,
    public readonly otp: string
  ) {}
}

export class VerifyForgotPasswordOtpCommandHandler implements IRequestHandler<VerifyForgotPasswordOtpCommand, any> {
  constructor(
    private userRepo: IUserRepository,
    private cacheService: ICacheService,
    private logger: ILoggerService
  ) {}

  async handle(command: VerifyForgotPasswordOtpCommand): Promise<any> {
    const { identifier, otp } = command;

    if (!identifier || !otp) {
      throw new BadRequestError('Email/mobile number and OTP are required');
    }

    let user = await this.userRepo.findByEmail(identifier);
    if (!user) {
      user = await this.userRepo.findByPhone(identifier);
    }

    if (!user || user.deletedAt) {
      throw new NotFoundError('User account not found');
    }

    const cacheKey = `forgot_pwd_otp:${user.id}`;
    const cachedOtp = await this.cacheService.get<string>(cacheKey);

    if (!cachedOtp || cachedOtp !== otp.trim()) {
      throw new BadRequestError('Invalid or expired OTP');
    }

    // OTP is valid! Clear the OTP key
    await this.cacheService.del(cacheKey);

    // Generate a secure resetToken (15 minute TTL)
    const resetToken = crypto.randomBytes(32).toString('hex');
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
