"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RazorpayPaymentGatewayProvider = void 0;
const razorpay_1 = __importDefault(require("razorpay"));
const crypto_1 = __importDefault(require("crypto"));
const client_1 = require("@prisma/client");
const errors_1 = require("../../../application/common/errors");
class RazorpayPaymentGatewayProvider {
    configRepo;
    cryptoService;
    logger;
    constructor(configRepo, cryptoService, logger) {
        this.configRepo = configRepo;
        this.cryptoService = cryptoService;
        this.logger = logger;
    }
    async getRazorpayClient() {
        const config = await this.configRepo.findIntegration(client_1.IntegrationService.RAZORPAY);
        if (!config || !config.isActive) {
            return { client: null };
        }
        try {
            const creds = this.cryptoService.decryptCredentials(config.credentials);
            if (creds && creds.keyId && creds.keySecret) {
                const client = new razorpay_1.default({
                    key_id: creds.keyId,
                    key_secret: creds.keySecret,
                });
                return {
                    client,
                    keySecret: creds.keySecret,
                    webhookSecret: creds.webhookSecret,
                };
            }
        }
        catch (e) {
            this.logger.warn('[RazorpayProvider] Decryption error for credentials.', { error: e });
        }
        return { client: null };
    }
    async createOrder(amount, currency, receipt) {
        if (process.env.NODE_ENV === 'test') {
            const mockOrderId = `order_${crypto_1.default.randomBytes(8).toString('hex')}`;
            this.logger.info(`[RazorpayProvider] [TEST MOCK] Created mock order ${mockOrderId} for ${amount} ${currency}`);
            return { id: mockOrderId, amount, currency: currency || 'INR', receipt };
        }
        const { client } = await this.getRazorpayClient();
        if (!client) {
            throw new errors_1.BadRequestError('Payment gateway is not configured. Admin has to configure Razorpay credentials.');
        }
        try {
            const order = await client.orders.create({
                amount: Math.round(amount * 100), // convert to paise
                currency: currency || 'INR',
                receipt,
            });
            this.logger.info(`[RazorpayProvider] Created real order ${order.id} for ${amount} ${currency}`);
            return { id: order.id, amount, currency: currency || 'INR', receipt };
        }
        catch (err) {
            this.logger.error('[RazorpayProvider] Failed to create Razorpay Order via SDK', err);
            throw new errors_1.BadRequestError(`Razorpay order creation failed: ${err.message || 'Payment gateway error'}`);
        }
    }
    async verifyWebhookSignature(payload, signature, secret) {
        const { webhookSecret } = await this.getRazorpayClient();
        const activeSecret = secret || webhookSecret;
        let body;
        if (Buffer.isBuffer(payload)) {
            body = payload.toString("utf8");
        }
        else if (typeof payload === "string") {
            body = payload;
        }
        else {
            body = JSON.stringify(payload);
        }
        const expectedSignature = crypto_1.default
            .createHmac("sha256", activeSecret)
            .update(body)
            .digest("hex");
        return expectedSignature === signature;
    }
    async verifyPaymentSignature(orderId, paymentId, signature) {
        try {
            const { keySecret } = await this.getRazorpayClient();
            if (!keySecret) {
                this.logger.warn('[RazorpayProvider] keySecret not found — cannot verify payment signature');
                return false;
            }
            const expectedSignature = crypto_1.default
                .createHmac('sha256', keySecret)
                .update(`${orderId}|${paymentId}`)
                .digest('hex');
            const isValid = expectedSignature === signature;
            if (!isValid) {
                this.logger.warn('[RazorpayProvider] Payment signature mismatch', { orderId, paymentId });
            }
            return isValid;
        }
        catch (err) {
            this.logger.error('[RazorpayProvider] Payment signature validation error', err);
            return false;
        }
    }
    async initiateRefund(paymentId, amount, notes) {
        if (process.env.NODE_ENV === 'test') {
            const mockRefundId = `rfnd_${crypto_1.default.randomBytes(8).toString('hex')}`;
            this.logger.info(`[RazorpayProvider] [TEST MOCK] Initiated mock refund of ${amount} INR for payment ${paymentId}`);
            return { success: true, refundId: mockRefundId, amount };
        }
        const { client } = await this.getRazorpayClient();
        if (!client) {
            throw new errors_1.BadRequestError('Payment gateway is not configured. Admin has to configure Razorpay credentials.');
        }
        try {
            const refund = await client.payments.refund(paymentId, {
                amount: Math.round(amount * 100),
                notes,
            });
            this.logger.info(`[RazorpayProvider] Real refund of ${amount} INR processed for payment ${paymentId}`, { refundId: refund.id });
            return { success: true, refundId: refund.id, amount };
        }
        catch (err) {
            this.logger.error(`[RazorpayProvider] Live refund failed for payment ${paymentId}`, err);
            throw new errors_1.BadRequestError(`Razorpay refund failed: ${err.message || 'Payment gateway error'}`);
        }
    }
    async transferPayout(destinationBankDetail, amount) {
        if (process.env.NODE_ENV === 'test') {
            const mockPayoutId = `pout_${crypto_1.default.randomBytes(8).toString('hex')}`;
            this.logger.info(`[RazorpayProvider] [TEST MOCK] Initiated mock transfer ${mockPayoutId} of ${amount} INR to ${destinationBankDetail.accountHolderName}`);
            return { success: true, payoutId: mockPayoutId };
        }
        const { client } = await this.getRazorpayClient();
        if (!client) {
            throw new errors_1.BadRequestError('Payment gateway is not configured. Admin has to configure Razorpay credentials.');
        }
        try {
            if (client.transfers?.create) {
                const transfer = await client.transfers.create({
                    account: destinationBankDetail.accountNumber,
                    amount: Math.round(amount * 100),
                    currency: 'INR',
                });
                this.logger.info(`[RazorpayProvider] Initiated live transfer ${transfer.id} of ${amount} INR to ${destinationBankDetail.accountHolderName}`);
                return { success: true, payoutId: transfer.id };
            }
            throw new errors_1.BadRequestError('Razorpay transfer service is not supported by current client configuration.');
        }
        catch (err) {
            this.logger.error('[RazorpayProvider] Live transfer failed', err);
            return { success: false, payoutId: '', error: err.message };
        }
    }
}
exports.RazorpayPaymentGatewayProvider = RazorpayPaymentGatewayProvider;
