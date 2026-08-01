import { IBoostedEventRepository } from '../../../domain/repositories/boosted-event.repository';
import { IConfigRepository } from '../../../domain/repositories/config.repository';
import { ICryptoService } from '../../services/crypto.service';
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
    private configRepo: IConfigRepository,
    private cryptoService: ICryptoService
  ) {}

  async handle(command: VerifyBoostPaymentCommand): Promise<any> {
    const { boostId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = command;

    let dbBoost = await this.boostedRepo.findById(boostId);
    if (!dbBoost && razorpayOrderId) {
      dbBoost = await this.boostedRepo.findByRazorpayOrderId(razorpayOrderId);
    }

    if (!dbBoost) {
      throw new NotFoundError('Boost request not found');
    }

    if (dbBoost.status === 'ACTIVE' || dbBoost.status === 'APPROVED' || dbBoost.webhookProcessed) {
      return { success: true, boost: dbBoost, message: 'Boost payment is already verified and active' };
    }

    const now = new Date();
    const startDate = new Date(dbBoost.startDate);
    const endDate = new Date(dbBoost.endDate);

    let initialStatus: 'ACTIVE' | 'APPROVED' = 'ACTIVE';
    let isActive = true;

    if (now < startDate) {
      initialStatus = 'APPROVED';
      isActive = false;
    }

    const config = await this.configRepo.findIntegration(IntegrationService.RAZORPAY);
    if (!config || !config.credentials || typeof config.credentials !== 'object') {
      throw new BadRequestError('Payment gateway is not configured. Admin has to configure Razorpay credentials.');
    }

    const decrypted = this.cryptoService.decryptCredentials(config.credentials);
    const keySecret = decrypted?.keySecret;
    if (!keySecret) {
      throw new BadRequestError('Payment gateway is not configured. Admin has to configure Razorpay credentials.');
    }

    // Verify signature
    const hmac = crypto.createHmac('sha256', keySecret);
    hmac.update(`${razorpayOrderId}|${razorpayPaymentId}`);
    const generatedSignature = hmac.digest('hex');

    if (generatedSignature !== razorpaySignature) {
      throw new BadRequestError('Invalid payment signature');
    }

    // Approve & activate the boost
    const boost = await this.boostedRepo.markPaymentCaptured(dbBoost.id, {
      razorpayPaymentId,
      paymentMethod: 'RAZORPAY',
      paymentCapturedAt: new Date(),
      paymentGateway: 'RAZORPAY',
      status: initialStatus,
      isActive,
    });

    return { success: true, boost };
  }
}
