"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateConfigCommandHandler = exports.UpdateConfigCommand = void 0;
class UpdateConfigCommand {
    serviceName;
    environment;
    credentials;
    isActive;
    updatedBy;
    __tag = 'UpdateConfigCommand';
    constructor(serviceName, environment, credentials, isActive, updatedBy) {
        this.serviceName = serviceName;
        this.environment = environment;
        this.credentials = credentials;
        this.isActive = isActive;
        this.updatedBy = updatedBy;
    }
}
exports.UpdateConfigCommand = UpdateConfigCommand;
class UpdateConfigCommandHandler {
    configRepo;
    cryptoService;
    cacheService;
    constructor(configRepo, cryptoService, cacheService) {
        this.configRepo = configRepo;
        this.cryptoService = cryptoService;
        this.cacheService = cacheService;
    }
    async handle(command) {
        const { serviceName, environment, credentials, isActive, updatedBy } = command;
        const encrypted = this.cryptoService.encryptCredentials(credentials);
        const config = await this.configRepo.upsertIntegration(serviceName, {
            environment,
            credentials: encrypted,
            isActive,
            updatedBy,
        });
        // Invalidate Redis integration config cache
        await this.cacheService.del(`configs:integrations:${serviceName}`);
        return config;
    }
}
exports.UpdateConfigCommandHandler = UpdateConfigCommandHandler;
