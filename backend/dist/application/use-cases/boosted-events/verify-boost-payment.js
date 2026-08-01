"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerifyBoostPaymentCommandHandler = exports.VerifyBoostPaymentCommand = void 0;
const errors_1 = require("../../common/errors");
const crypto_1 = __importDefault(require("crypto"));
const client_1 = require("@prisma/client");
class VerifyBoostPaymentCommand {
    boostId;
    razorpayPaymentId;
    razorpayOrderId;
    razorpaySignature;
    __tag = 'VerifyBoostPaymentCommand';
    constructor(boostId, razorpayPaymentId, razorpayOrderId, razorpaySignature) {
        this.boostId = boostId;
        this.razorpayPaymentId = razorpayPaymentId;
        this.razorpayOrderId = razorpayOrderId;
        this.razorpaySignature = razorpaySignature;
    }
}
exports.VerifyBoostPaymentCommand = VerifyBoostPaymentCommand;
class VerifyBoostPaymentCommandHandler {
    boostedRepo;
    configRepo;
    cryptoService;
    constructor(boostedRepo, configRepo, cryptoService) {
        this.boostedRepo = boostedRepo;
        this.configRepo = configRepo;
        this.cryptoService = cryptoService;
    }
    async handle(command) {
        const { boostId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = command;
        let dbBoost = await this.boostedRepo.findById(boostId);
        if (!dbBoost && razorpayOrderId) {
            dbBoost = await this.boostedRepo.findByRazorpayOrderId(razorpayOrderId);
        }
        if (!dbBoost) {
            throw new errors_1.NotFoundError('Boost request not found');
        }
        if (dbBoost.status === 'ACTIVE' || dbBoost.status === 'APPROVED' || dbBoost.webhookProcessed) {
            return { success: true, boost: dbBoost, message: 'Boost payment is already verified and active' };
        }
        const now = new Date();
        const startDate = new Date(dbBoost.startDate);
        const endDate = new Date(dbBoost.endDate);
        let initialStatus = 'ACTIVE';
        let isActive = true;
        if (now < startDate) {
            initialStatus = 'APPROVED';
            isActive = false;
        }
        const config = await this.configRepo.findIntegration(client_1.IntegrationService.RAZORPAY);
        if (!config || !config.credentials || typeof config.credentials !== 'object') {
            throw new errors_1.BadRequestError('Payment gateway is not configured. Admin has to configure Razorpay credentials.');
        }
        const decrypted = this.cryptoService.decryptCredentials(config.credentials);
        const keySecret = decrypted?.keySecret;
        if (!keySecret) {
            throw new errors_1.BadRequestError('Payment gateway is not configured. Admin has to configure Razorpay credentials.');
        }
        // Verify signature
        const hmac = crypto_1.default.createHmac('sha256', keySecret);
        hmac.update(`${razorpayOrderId}|${razorpayPaymentId}`);
        const generatedSignature = hmac.digest('hex');
        if (generatedSignature !== razorpaySignature) {
            throw new errors_1.BadRequestError('Invalid payment signature');
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
exports.VerifyBoostPaymentCommandHandler = VerifyBoostPaymentCommandHandler;
