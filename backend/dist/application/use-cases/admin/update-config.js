"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateConfigCommandHandler = exports.UpdateConfigCommand = void 0;
const client_1 = require("@prisma/client");
const errors_1 = require("../../../api/common/errors");
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
        if (environment && !Object.values(client_1.IntegrationEnvironment).includes(environment)) {
            throw new errors_1.BadRequestError('Invalid environment. Expected TEST or LIVE');
        }
        const existing = await this.configRepo.findIntegration(serviceName);
        const updatedEnv = environment || existing?.environment || client_1.IntegrationEnvironment.TEST;
        const updatedIsActive = isActive !== undefined ? isActive : (existing?.isActive ?? true);
        let encryptedCreds = existing?.credentials;
        if (credentials && typeof credentials === 'object' && Object.keys(credentials).length > 0) {
            encryptedCreds = this.cryptoService.encryptCredentials(credentials);
        }
        const config = await this.configRepo.upsertIntegration(serviceName, {
            environment: updatedEnv,
            credentials: encryptedCreds || {},
            isActive: updatedIsActive,
            updatedBy,
        });
        // Invalidate Redis integration config cache
        await this.cacheService.del(`configs:integrations:${serviceName}`);
        // Return masked credentials response matching GetConfigsQueryHandler format
        let maskedCredentials = {};
        try {
            if (config.credentials) {
                const decrypted = this.cryptoService.decryptCredentials(config.credentials);
                maskedCredentials = this.maskObj(decrypted);
            }
        }
        catch {
            maskedCredentials = { status: 'Encrypted' };
        }
        return {
            ...config,
            credentials: maskedCredentials,
        };
    }
    maskObj(obj) {
        if (!obj || typeof obj !== 'object')
            return obj;
        const masked = {};
        for (const key of Object.keys(obj)) {
            if (typeof obj[key] === 'string') {
                const str = obj[key];
                if (str.length <= 4) {
                    masked[key] = '****';
                }
                else {
                    masked[key] = '****' + str.substring(str.length - 4);
                }
            }
            else if (typeof obj[key] === 'object') {
                masked[key] = this.maskObj(obj[key]);
            }
            else {
                masked[key] = obj[key];
            }
        }
        return masked;
    }
}
exports.UpdateConfigCommandHandler = UpdateConfigCommandHandler;
