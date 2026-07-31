import { IBoostedEventRepository } from '../../../domain/repositories/boosted-event.repository';
import { IConfigRepository } from '../../../domain/repositories/config.repository';
import { IRequest, IRequestHandler } from '../../common/mediator';
import { BadRequestError, NotFoundError } from '../../common/errors';
import crypto from 'crypto';
import { IntegrationService } from '@prisma/client';

export class VerifyBoostPaymentCommand implements IRequest<any> {
  readonly __tag = 'VerifyBoostPaymentCommand';
  constructor(
    public readonly boostId: string,
    public readonly razorpayPaymentId: string,
    public readonly razorpayOrderId: string,
    public readonly razorpaySignature: string
  ) {}
}

export class VerifyBoostPaymentCommandHandler implements IRequestHandler<VerifyBoostPaymentCommand, any> {
  constructor(
    private boostedRepo: IBoostedEventRepository,
    private configRepo: IConfigRepository
  ) {}

  async handle(command: VerifyBoostPaymentCommand): Promise<any> {
    const dbBoost = await this.boostedRepo.findById(command.boostId);
    if (!dbBoost) {
      throw new NotFoundError('Boost request not found');
    }

    const now = new Date();
    const startDate = new Date(dbBoost.startDate);
    const endDate = new Date(dbBoost.endDate);

    let initialStatus: 'ACTIVE' | 'APPROVED' | 'EXPIRED' = 'ACTIVE';
    let isActive = true;

    if (now < startDate) {
      initialStatus = 'APPROVED';
      isActive = false;
    } else if (now > endDate) {
      initialStatus = 'EXPIRED';
      isActive = false;
    }

    if (command.razorpaySignature === 'MOCK_SUCCESS') {
      // Bypass Razorpay config check and signature verification for testing
      const boost = await this.boostedRepo.update(command.boostId, {
        status: initialStatus,
        isActive
      } as any);
      return { success: true, boost };
    }

    const config = await this.configRepo.findIntegration(IntegrationService.RAZORPAY);
    if (!config || !config.credentials || typeof config.credentials !== 'object') {
      throw new BadRequestError('Razorpay is not configured on this platform');
    }

    const keySecret = (config.credentials as any).keySecret;
    if (!keySecret) {
      throw new BadRequestError('Razorpay keySecret is missing');
    }

    // Verify signature
    const hmac = crypto.createHmac('sha256', keySecret);
    hmac.update(`${command.razorpayOrderId}|${command.razorpayPaymentId}`);
    const generatedSignature = hmac.digest('hex');

    if (generatedSignature !== command.razorpaySignature) {
      throw new BadRequestError('Invalid payment signature');
    }

    // Approve the boost
    const boost = await this.boostedRepo.update(command.boostId, {
      status: initialStatus,
      isActive
    } as any);

    return { success: true, boost };
  }
}
