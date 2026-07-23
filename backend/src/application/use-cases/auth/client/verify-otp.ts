import { IRequest, IRequestHandler } from '../../../common/mediator';
import { ICacheService } from '../../../services/cache.service';
import { ILoggerService } from '../../../services/logger.service';
import { BadRequestError } from '../../../../api/common/errors';

export class ClientVerifyOtpCommand implements IRequest<any> {
  readonly __tag = 'ClientVerifyOtpCommand';
  constructor(
    public readonly phone: string,
    public readonly otp: string
  ) {}
}

export class ClientVerifyOtpCommandHandler implements IRequestHandler<ClientVerifyOtpCommand, any> {
  constructor(
    private cacheService: ICacheService,
    private logger: ILoggerService
  ) {}

  async handle(command: ClientVerifyOtpCommand): Promise<any> {
    const { phone, otp } = command;

    if (!phone || !otp) {
      throw new BadRequestError('WhatsApp / Mobile number and OTP code are required');
    }

    const normalizedPhone = phone.trim();
    const primaryKey = `otp:CLIENT_PHONE:${normalizedPhone}`;
    const fallbackKey = `otp:PHONE:${normalizedPhone}`;

    let cachedOtp = await this.cacheService.get<string>(primaryKey);
    if (!cachedOtp) {
      cachedOtp = await this.cacheService.get<string>(fallbackKey);
    }

    if (!cachedOtp) {
      throw new BadRequestError('OTP has expired or was not requested');
    }

    if (cachedOtp !== otp.trim()) {
      throw new BadRequestError('Invalid OTP code provided');
    }

    // Mark as verified for 15 minutes (900 seconds)
    const verifiedKeyPrimary = `otp:verified:CLIENT_PHONE:${normalizedPhone}`;
    const verifiedKeyFallback = `otp:verified:PHONE:${normalizedPhone}`;
    await this.cacheService.set(verifiedKeyPrimary, '1', 900);
    await this.cacheService.set(verifiedKeyFallback, '1', 900);

    // Delete active OTP keys
    await this.cacheService.del(primaryKey);
    await this.cacheService.del(fallbackKey);

    this.logger.info(`[ClientVerifyOtp] Verified OTP for client phone: ${normalizedPhone}`);

    return {
      success: true,
      message: 'WhatsApp / Phone number verified successfully',
    };
  }
}
