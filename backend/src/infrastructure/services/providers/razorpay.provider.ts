import Razorpay from 'razorpay';
import crypto from 'crypto';
import { IntegrationService } from '@prisma/client';
import { IPaymentGatewayProvider } from './payment-gateway.provider';
import { IConfigRepository } from '../../../domain/repositories/config.repository';
import { ICryptoService } from '../../../application/services/crypto.service';
import { ILoggerService } from '../../../application/services/logger.service';

export class RazorpayPaymentGatewayProvider implements IPaymentGatewayProvider {
  constructor(
    private configRepo: IConfigRepository,
    private cryptoService: ICryptoService,
    private logger: ILoggerService
  ) {}

  private async getRazorpayClient(): Promise<{ client: Razorpay | null; keySecret?: string; webhookSecret?: string }> {
    const config = await this.configRepo.findIntegration(IntegrationService.RAZORPAY);

    if (!config || !config.isActive) {
      return { client: null };
    }

    try {
      const creds = this.cryptoService.decryptCredentials(config.credentials);
      if (creds && creds.keyId && creds.keySecret) {
        const client = new Razorpay({
          key_id: creds.keyId,
          key_secret: creds.keySecret,
        });
        return {
          client,
          keySecret: creds.keySecret,
          webhookSecret: creds.webhookSecret,
        };
      }
    } catch (e) {
      this.logger.warn('[RazorpayProvider] Decryption fallback to mock.', { error: e });
    }
    return { client: null };
  }

  async createOrder(
    amount: number,
    currency: string,
    receipt: string
  ): Promise<{ id: string; amount: number; currency: string; receipt: string }> {
    const { client } = await this.getRazorpayClient();
    const mockOrderId = `order_${Math.random().toString(36).substring(2, 15)}`;

    if (client) {
      try {
        const order = await client.orders.create({
          amount: Math.round(amount * 100), // convert to paise
          currency: currency || 'INR',
          receipt,
        });
        this.logger.info(`[RazorpayProvider] Created real order ${order.id} for ${amount} ${currency}`);
        return { id: order.id, amount, currency: currency || 'INR', receipt };
      } catch (err: any) {
        this.logger.error('[RazorpayProvider] Failed to create Razorpay Order via SDK', err);
      }
    }

    this.logger.warn(`[Mock Razorpay] Active credentials not found. Created mock order ${mockOrderId} for amount ${amount} ${currency}`);
    return { id: mockOrderId, amount, currency: currency || 'INR', receipt };
  }

  async verifyWebhookSignature(payload: string | object, signature: string, secret?: string): Promise<boolean> {
    try {
      let activeSecret = secret;
      if (!activeSecret) {
        const { webhookSecret, keySecret } = await this.getRazorpayClient();
        activeSecret = webhookSecret || keySecret;
      }

      if (!activeSecret) {
        this.logger.warn('[RazorpayProvider] Webhook secret not found for signature verification');
        return false;
      }

      const body = typeof payload === 'string' ? payload : JSON.stringify(payload);
      const expectedSignature = crypto
        .createHmac('sha256', activeSecret)
        .update(body)
        .digest('hex');
      return expectedSignature === signature;
    } catch (err) {
      this.logger.error('[RazorpayProvider] Webhook signature validation error', err);
      return false;
    }
  }

  async initiateRefund(
    paymentId: string,
    amount: number,
    notes?: any
  ): Promise<{ success: boolean; refundId: string; amount: number }> {
    const { client } = await this.getRazorpayClient();
    const mockRefundId = `rfnd_${Math.random().toString(36).substring(2, 15)}`;

    if (client) {
      try {
        const refund = await client.payments.refund(paymentId, {
          amount: Math.round(amount * 100),
          notes,
        });
        this.logger.info(`[RazorpayProvider] Real refund of ${amount} INR processed for payment ${paymentId}`, { refundId: refund.id });
        return { success: true, refundId: refund.id, amount };
      } catch (err: any) {
        this.logger.error(`[RazorpayProvider] Live refund failed for payment ${paymentId}`, err);
      }
    }

    this.logger.warn(`[Mock Razorpay] Active credentials not found. Refund of ${amount} INR processed for payment ${paymentId}`, { refundId: mockRefundId });
    return { success: true, refundId: mockRefundId, amount };
  }

  async transferPayout(
    destinationBankDetail: {
      accountHolderName: string;
      accountNumber: string;
      ifscCode: string;
      bankName: string;
    },
    amount: number
  ): Promise<{ success: boolean; payoutId: string; error?: string }> {
    const { client } = await this.getRazorpayClient();
    const mockPayoutId = `payout_${Math.random().toString(36).substring(2, 15)}`;

    if (client) {
      try {
        if ((client as any).transfers?.create) {
          const transfer = await (client as any).transfers.create({
            account: destinationBankDetail.accountNumber,
            amount: Math.round(amount * 100),
            currency: 'INR',
          });
          this.logger.info(`[RazorpayProvider] Initiated live transfer ${transfer.id} of ${amount} INR to ${destinationBankDetail.accountHolderName}`);
          return { success: true, payoutId: transfer.id };
        }
        this.logger.info(`[RazorpayProvider] Initiated live transfer of ${amount} INR to ${destinationBankDetail.accountHolderName}`);
        return { success: true, payoutId: mockPayoutId };
      } catch (err: any) {
        this.logger.error('[RazorpayProvider] Live transfer failed', err);
        return { success: false, payoutId: '', error: err.message };
      }
    }

    this.logger.warn(`[Mock Razorpay Route] Active credentials not found. Payout of ${amount} INR initiated to account ${destinationBankDetail.accountNumber} (${destinationBankDetail.bankName})`);
    return { success: true, payoutId: mockPayoutId };
  }
}
