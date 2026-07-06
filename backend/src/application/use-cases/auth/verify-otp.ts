import { DeliveryChannel } from '@prisma/client';
import { IRequest, IRequestHandler } from '../../common/mediator';
import { ICacheService } from '../../services/cache.service';
import { ILoggerService } from '../../services/logger.service';
import { BadRequestError } from '../../../api/common/errors';

export class VerifyOtpCommand implements IRequest<any> {
  readonly __tag = 'VerifyOtpCommand';
  constructor(
    public readonly target: string,
    public readonly type: DeliveryChannel | 'EMAIL' | 'PHONE',
    public readonly otp: string
  ) {}
}

export class VerifyOtpCommandHandler implements IRequestHandler<VerifyOtpCommand, any> {
  constructor(
    private cacheService: ICacheService,
    private logger: ILoggerService
  ) {}

  async handle(command: VerifyOtpCommand): Promise<any> {
    const { target, type, otp } = command;

    if (!target || !type || !otp) {
      throw new BadRequestError('Target, type (EMAIL or PHONE/SMS), and OTP code are required');
    }

    const typeKey = (type === 'EMAIL' || (type as string) === 'EMAIL') ? 'EMAIL' : 'PHONE';
    const cacheKey = `otp:${typeKey}:${target}`;
    const cachedOtp = await this.cacheService.get<string>(cacheKey);

    if (!cachedOtp) {
      throw new BadRequestError('OTP has expired or was not requested');
    }

    if (cachedOtp !== otp) {
      throw new BadRequestError('Invalid OTP code provided');
    }

    // Mark as verified for 15 minutes (900 seconds)
    const verifiedKey = `otp:verified:${typeKey}:${target}`;
    await this.cacheService.set(verifiedKey, '1', 900);

    // Delete active OTP
    await this.cacheService.del(cacheKey);

    this.logger.info(`[VerifyOtp] Verified OTP for ${typeKey} target: ${target}`);

    return {
      success: true,
      message: `${typeKey} verified successfully`,
    };
  }
}
