"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetRazorpayPublicKeyQueryHandler = exports.GetRazorpayPublicKeyQuery = void 0;
const errors_1 = require("../../common/errors");
class GetRazorpayPublicKeyQuery {
    __tag = 'GetRazorpayPublicKeyQuery';
}
exports.GetRazorpayPublicKeyQuery = GetRazorpayPublicKeyQuery;
class GetRazorpayPublicKeyQueryHandler {
    configRepository;
    cryptoService;
    constructor(configRepository, cryptoService) {
        this.configRepository = configRepository;
        this.cryptoService = cryptoService;
    }
    async handle() {
        const config = await this.configRepository.findIntegration('RAZORPAY');
        if (!config || !config.isActive) {
            throw new errors_1.BadRequestError('Payment gateway is not configured. Admin has to configure Razorpay credentials.');
        }
        const credentials = this.cryptoService.decryptCredentials(config.credentials);
        if (!credentials || !credentials.keyId) {
            throw new errors_1.BadRequestError('Payment gateway is not configured. Admin has to configure Razorpay credentials.');
        }
        return {
            keyId: credentials.keyId,
        };
    }
}
exports.GetRazorpayPublicKeyQueryHandler = GetRazorpayPublicKeyQueryHandler;
