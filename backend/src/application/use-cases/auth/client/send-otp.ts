import { IRequest, IRequestHandler } from '../../../common/mediator';
import { ICacheService } from '../../../services/cache.service';
import { ICommunicationService } from '../../../services/communication.service';
import { IUserRepository } from '../../../../domain/repositories/user.repository';
import { ILoggerService } from '../../../services/logger.service';
import { BadRequestError, TooManyRequestsError } from '../../../../api/common/errors';
import { generateClientWhatsAppOtpTemplate } from '../../../../constants/templates';

export class ClientSendOtpCommand implements IRequest<any> {
  readonly __tag = 'ClientSendOtpCommand';
  constructor(
    public readonly phone: string
  ) {}
}

export class ClientSendOtpCommandHandler implements IRequestHandler<ClientSendOtpCommand, any> {
  constructor(
    private cacheService: ICacheService,
    private commsService: ICommunicationService,
    private userRepo: IUserRepository,
    private logger: ILoggerService
  ) {}

  async handle(command: ClientSendOtpCommand): Promise<any> {
    const { phone } = command;

    if (!phone || typeof phone !== 'string' || !phone.trim()) {
      throw new BadRequestError('WhatsApp / Mobile number is required');
    }

    const normalizedPhone = phone.trim();

    // Check rate limit: Maximum 3 OTP requests per hour (3600s)
    // Rate limiting is disabled in development / test environments
    const rateLimitKey = `otp_rate_limit:${normalizedPhone}`;
    const currentCountVal = await this.cacheService.get<number | string>(rateLimitKey);
    const currentCount = currentCountVal ? Number(currentCountVal) : 0;
    const isDev = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';

    if (!isDev && currentCount >= 3) {
      throw new TooManyRequestsError('Maximum OTP request limit reached (3 OTPs per hour). Please try again after 1 hour.');
    }

    // Check if phone number is already registered
    const existing = await this.userRepo.findByPhone(normalizedPhone);
    if (existing) {
      throw new BadRequestError('Phone number is already registered');
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Cache in Redis for 10 minutes (600s)
    const cacheKey = `otp:CLIENT_PHONE:${normalizedPhone}`;
    const fallbackCacheKey = `otp:PHONE:${normalizedPhone}`;
    await this.cacheService.set(cacheKey, otp, 600);
    await this.cacheService.set(fallbackCacheKey, otp, 600);
    await this.cacheService.set(rateLimitKey, currentCount + 1, 3600);

    // Send via WhatsApp using template
    const whatsappBody = generateClientWhatsAppOtpTemplate({ otp, expiresInMinutes: 10 });
    try {
      await this.commsService.sendWhatsApp(normalizedPhone, whatsappBody);
    } catch (err) {
      // Fallback to SMS if WhatsApp dispatch encounters an error
      await this.commsService.sendSMS(normalizedPhone, whatsappBody);
    }

    this.logger.info(`[ClientSendOtp] Sent registration WhatsApp OTP to ${normalizedPhone}`);

    return {
      success: true,
      message: 'OTP sent successfully to WhatsApp / mobile number',
      expiresInSeconds: 600,
      ...(process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test' ? { devOtp: otp } : {}),
    };
  }
}
