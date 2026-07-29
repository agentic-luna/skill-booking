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
    constructor(boostedRepo, configRepo) {
        this.boostedRepo = boostedRepo;
        this.configRepo = configRepo;
    }
    async handle(command) {
        if (command.razorpaySignature === 'MOCK_SUCCESS') {
            // Bypass Razorpay config check and signature verification for testing
            const boost = await this.boostedRepo.update(command.boostId, {
                status: 'APPROVED',
                isActive: true
            });
            return { success: true, boost };
        }
        const config = await this.configRepo.findIntegration(client_1.IntegrationService.RAZORPAY);
        if (!config || !config.credentials || typeof config.credentials !== 'object') {
            throw new errors_1.BadRequestError('Razorpay is not configured on this platform');
        }
        const keySecret = config.credentials.keySecret;
        if (!keySecret) {
            throw new errors_1.BadRequestError('Razorpay keySecret is missing');
        }
        // Verify signature
        const hmac = crypto_1.default.createHmac('sha256', keySecret);
        hmac.update(`${command.razorpayOrderId}|${command.razorpayPaymentId}`);
        const generatedSignature = hmac.digest('hex');
        if (generatedSignature !== command.razorpaySignature) {
            throw new errors_1.BadRequestError('Invalid payment signature');
        }
        // Approve the boost
        const boost = await this.boostedRepo.update(command.boostId, {
            status: 'APPROVED',
            isActive: true
        });
        return { success: true, boost };
    }
}
exports.VerifyBoostPaymentCommandHandler = VerifyBoostPaymentCommandHandler;
