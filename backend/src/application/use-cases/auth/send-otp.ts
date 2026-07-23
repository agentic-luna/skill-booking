import { DeliveryChannel } from '@prisma/client';
import { IRequest, IRequestHandler } from '../../common/mediator';
import { ICacheService } from '../../services/cache.service';
import { ICommunicationService } from '../../services/communication.service';
import { IUserRepository } from '../../../domain/repositories/user.repository';
import { ILoggerService } from '../../services/logger.service';
import { BadRequestError, TooManyRequestsError } from '../../../api/common/errors';

export class SendOtpCommand implements IRequest<any> {
  readonly __tag = 'SendOtpCommand';
  constructor(
    public readonly target: string,
    public readonly type: DeliveryChannel | 'EMAIL' | 'PHONE'
  ) { }
}

export class SendOtpCommandHandler implements IRequestHandler<SendOtpCommand, any> {
  constructor(
    private cacheService: ICacheService,
    private commsService: ICommunicationService,
    private userRepo: IUserRepository,
    private logger: ILoggerService
  ) { }

  async handle(command: SendOtpCommand): Promise<any> {
    const { target, type } = command;

    if (!target || !type) {
      throw new BadRequestError('Target and type (EMAIL or PHONE/SMS) are required');
    }

    const normalizedType = type === DeliveryChannel.EMAIL ? DeliveryChannel.EMAIL : DeliveryChannel.SMS;
    // Normalize target: lowercase for email, trim for phone
    const normalizedTarget = normalizedType === DeliveryChannel.EMAIL
      ? target.toLowerCase().trim()
      : target.trim();

    // Check rate limit: Maximum 3 OTP requests per hour (3600s)
    const rateLimitKey = `otp_rate_limit:${normalizedTarget}`;
    const currentCountVal = await this.cacheService.get<number | string>(rateLimitKey);
    const currentCount = currentCountVal ? Number(currentCountVal) : 0;

    if (currentCount >= 3) {
      throw new TooManyRequestsError('Maximum OTP request limit reached (3 OTPs per hour). Please try again after 1 hour.');
    }

    if (normalizedType === DeliveryChannel.EMAIL) {
      const existing = await this.userRepo.findByEmail(normalizedTarget);
      if (existing) {
        throw new BadRequestError('Email is already registered');
      }
    } else {
      const existing = await this.userRepo.findByPhone(normalizedTarget);
      if (existing) {
        throw new BadRequestError('Phone number is already registered');
      }
    }

    // Generate secure 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Cache in Redis for 10 minutes (600s)
    const typeKey = normalizedType === DeliveryChannel.EMAIL ? 'EMAIL' : 'PHONE';
    const cacheKey = `otp:${typeKey}:${normalizedTarget}`;
    await this.cacheService.set(cacheKey, otp, 600);
    await this.cacheService.set(rateLimitKey, currentCount + 1, 3600);

    // Send via provider
    if (normalizedType === DeliveryChannel.EMAIL) {
      await this.commsService.sendEmail(
        normalizedTarget,
        'Your Registration Verification OTP',
        `Your OTP for registration verification is: ${otp}. It is valid for 10 minutes.`
      );
    } else {
      await this.commsService.sendSMS(
        normalizedTarget,
        `Your registration OTP is: ${otp}. Valid for 10 minutes.`
      );
    }

    this.logger.info(`[SendOtp] Sent OTP for ${normalizedType} to ${normalizedTarget}`);

    return {
      success: true,
      message: `OTP sent successfully to ${normalizedType.toLowerCase()}`,
      expiresInSeconds: 600,
      ...(process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test' ? { devOtp: otp } : {}),
    };
  }
}
