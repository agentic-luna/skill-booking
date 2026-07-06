import { IRequest, IRequestHandler } from '../../common/mediator';
import { IUserRepository } from '../../../domain/repositories/user.repository';
import { ICacheService } from '../../services/cache.service';
import { ICommunicationService } from '../../services/communication.service';
import { ILoggerService } from '../../services/logger.service';
import { BadRequestError, NotFoundError } from '../../common/errors';

export class SendForgotPasswordOtpCommand implements IRequest<any> {
  readonly __tag = 'SendForgotPasswordOtpCommand';
  constructor(public readonly identifier: string) {}
}

export class SendForgotPasswordOtpCommandHandler implements IRequestHandler<SendForgotPasswordOtpCommand, any> {
  constructor(
    private userRepo: IUserRepository,
    private cacheService: ICacheService,
    private commsService: ICommunicationService,
    private logger: ILoggerService
  ) {}

  async handle(command: SendForgotPasswordOtpCommand): Promise<any> {
    const { identifier } = command;

    if (!identifier) {
      throw new BadRequestError('Email address or registered mobile number is required');
    }

    let user = await this.userRepo.findByEmail(identifier);
    if (!user) {
      user = await this.userRepo.findByPhone(identifier);
    }

    if (!user || user.deletedAt) {
      throw new NotFoundError('No active user account found with this email/mobile number');
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Cache in Redis under key forgot_pwd_otp:<userId> for 10 minutes (600s)
    const cacheKey = `forgot_pwd_otp:${user.id}`;
    await this.cacheService.set(cacheKey, otp, 600);

    // Send OTP to user's registered email
    await this.commsService.sendEmail(
      user.email,
      'Password Reset OTP Verification',
      `Hello ${user.firstName},\n\nYour OTP for password reset is: ${otp}. It is valid for 10 minutes. If you did not request a password reset, please ignore this email.`
    );

    this.logger.info(`[SendForgotPasswordOtp] Sent password reset OTP to ${user.email}`);

    // Mask email for privacy response (e.g., j***n@domain.com)
    const parts = user.email.split('@');
    const maskedEmail = parts[0].length > 2
      ? `${parts[0][0]}***${parts[0][parts[0].length - 1]}@${parts[1]}`
      : `${parts[0][0]}***@${parts[1]}`;

    return {
      success: true,
      message: `OTP has been sent to your registered email (${maskedEmail})`,
      expiresInSeconds: 600,
      ...(process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test' ? { devOtp: otp } : {}),
    };
  }
}
