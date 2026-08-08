"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetupMetaWaCommandHandler = exports.SetupMetaWaCommand = void 0;
const client_1 = require("@prisma/client");
const errors_1 = require("../../../api/common/errors");
class SetupMetaWaCommand {
    environment;
    accessToken;
    phoneNumberId;
    businessAccountId;
    isActive;
    updatedBy;
    verifyToken;
    __tag = 'SetupMetaWaCommand';
    constructor(environment, accessToken, phoneNumberId, businessAccountId, isActive, updatedBy, verifyToken) {
        this.environment = environment;
        this.accessToken = accessToken;
        this.phoneNumberId = phoneNumberId;
        this.businessAccountId = businessAccountId;
        this.isActive = isActive;
        this.updatedBy = updatedBy;
        this.verifyToken = verifyToken;
    }
}
exports.SetupMetaWaCommand = SetupMetaWaCommand;
class SetupMetaWaCommandHandler {
    configRepo;
    cryptoService;
    cacheService;
    constructor(configRepo, cryptoService, cacheService) {
        this.configRepo = configRepo;
        this.cryptoService = cryptoService;
        this.cacheService = cacheService;
    }
    async handle(command) {
        const { environment, accessToken, phoneNumberId, businessAccountId, isActive, updatedBy, verifyToken } = command;
        if (!environment || !Object.values(client_1.IntegrationEnvironment).includes(environment)) {
            throw new errors_1.BadRequestError('Invalid environment. Expected TEST or LIVE');
        }
        if (!accessToken || !phoneNumberId || !businessAccountId) {
            throw new errors_1.BadRequestError('Missing required Meta WhatsApp credentials');
        }
        const credentials = {
            accessToken,
            phoneNumberId,
            businessAccountId,
            verifyToken: verifyToken || undefined,
        };
        const encrypted = this.cryptoService.encryptCredentials(credentials);
        const config = await this.configRepo.upsertIntegration(client_1.IntegrationService.META_WA, {
            environment,
            credentials: encrypted,
            isActive,
            updatedBy,
        });
        await this.cacheService.del(`configs:integrations:${client_1.IntegrationService.META_WA}`);
        return config;
    }
}
exports.SetupMetaWaCommandHandler = SetupMetaWaCommandHandler;
