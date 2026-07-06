"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetupRazorpayCommandHandler = exports.SetupRazorpayCommand = void 0;
const client_1 = require("@prisma/client");
const errors_1 = require("../../../api/common/errors");
class SetupRazorpayCommand {
    environment;
    keyId;
    keySecret;
    webhookSecret;
    isActive;
    updatedBy;
    __tag = 'SetupRazorpayCommand';
    constructor(environment, keyId, keySecret, webhookSecret, isActive, updatedBy) {
        this.environment = environment;
        this.keyId = keyId;
        this.keySecret = keySecret;
        this.webhookSecret = webhookSecret;
        this.isActive = isActive;
        this.updatedBy = updatedBy;
    }
}
exports.SetupRazorpayCommand = SetupRazorpayCommand;
class SetupRazorpayCommandHandler {
    configRepo;
    cryptoService;
    cacheService;
    constructor(configRepo, cryptoService, cacheService) {
        this.configRepo = configRepo;
        this.cryptoService = cryptoService;
        this.cacheService = cacheService;
    }
    async handle(command) {
        const { environment, keyId, keySecret, webhookSecret, isActive, updatedBy } = command;
        if (!keyId || !keySecret || !webhookSecret) {
            throw new errors_1.BadRequestError('Missing required Razorpay credentials');
        }
        const credentials = {
            keyId,
            keySecret,
            webhookSecret
        };
        const encrypted = this.cryptoService.encryptCredentials(credentials);
        const config = await this.configRepo.upsertIntegration(client_1.IntegrationService.RAZORPAY, {
            environment,
            credentials: encrypted,
            isActive,
            updatedBy,
        });
        await this.cacheService.del(`configs:integrations:${client_1.IntegrationService.RAZORPAY}`);
        return config;
    }
}
exports.SetupRazorpayCommandHandler = SetupRazorpayCommandHandler;
