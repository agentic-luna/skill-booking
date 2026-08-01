"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetRazorpayPublicKeyQueryHandler = exports.GetRazorpayPublicKeyQuery = void 0;
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
            return { keyId: null };
        }
        const credentials = this.cryptoService.decryptCredentials(config.credentials);
        console.log(credentials, "_______+++++++++________");
        return {
            keyId: credentials.keyId ?? null,
        };
    }
}
exports.GetRazorpayPublicKeyQueryHandler = GetRazorpayPublicKeyQueryHandler;
