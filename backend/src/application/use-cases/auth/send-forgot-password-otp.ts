import { IRequest, IRequestHandler } from '../../common/mediator';
import { IUserRepository } from '../../../domain/repositories/user.repository';
import { ICacheService } from '../../services/cache.service';
import { ICommunicationService } from '../../services/communication.service';
import { ILoggerService } from '../../services/logger.service';
import { BadRequestError, NotFoundError, TooManyRequestsError } from '../../common/errors';
import { generateForgotPasswordEmailTemplate, generateForgotPasswordSmsTemplate } from '../../../constants/templates';

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

    const normalizedIdentifier = identifier.trim().toLowerCase();

    // Check rate limit: Maximum 3 OTP requests per hour (3600s)
    // Rate limiting is disabled in development / test environments
    const rateLimitKey = `otp_rate_limit:${normalizedIdentifier}`;
    const currentCountVal = await this.cacheService.get<number | string>(rateLimitKey);
    const currentCount = currentCountVal ? Number(currentCountVal) : 0;
    const isDev = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';

    if (!isDev && currentCount >= 3) {
      throw new TooManyRequestsError('Maximum OTP request limit reached (3 OTPs per hour). Please try again after 1 hour.');
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
    await this.cacheService.set(rateLimitKey, currentCount + 1, 3600);

    // Send OTP to user's registered email or phone using templates
    const targetEmail = user.email;
    if (targetEmail) {
      const emailBody = generateForgotPasswordEmailTemplate({
        userName: user.firstName,
        otp,
        expiresInMinutes: 10,
      });
      await this.commsService.sendEmail(
        targetEmail,
        'Password Reset OTP Verification — BookMyTraining',
        emailBody
      );
      this.logger.info(`[SendForgotPasswordOtp] Sent password reset OTP to ${targetEmail}`);

      const parts = targetEmail.split('@');
      const maskedEmail = parts[0].length > 2
        ? `${parts[0][0]}***${parts[0][parts[0].length - 1]}@${parts[1]}`
        : `${parts[0][0]}***@${parts[1]}`;

      return {
        success: true,
        message: `OTP has been sent to your registered email (${maskedEmail})`,
        expiresInSeconds: 600,
        ...(process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test' ? { devOtp: otp } : {}),
      };
    } else {
      const smsBody = generateForgotPasswordSmsTemplate({
        userName: user.firstName,
        otp,
        expiresInMinutes: 10,
      });
      await this.commsService.sendSMS(
        user.phone,
        smsBody
      );
      this.logger.info(`[SendForgotPasswordOtp] Sent password reset OTP to mobile ${user.phone}`);

      const maskedPhone = user.phone.length > 4
        ? `${user.phone.slice(0, 3)}***${user.phone.slice(-2)}`
        : user.phone;

      return {
        success: true,
        message: `OTP has been sent to your registered mobile number (${maskedPhone})`,
        expiresInSeconds: 600,
        ...(process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test' ? { devOtp: otp } : {}),
      };
    }
  }
}
