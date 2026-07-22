"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetupSendgridCommandHandler = exports.SetupSendgridCommand = void 0;
const client_1 = require("@prisma/client");
const errors_1 = require("../../../api/common/errors");
class SetupSendgridCommand {
    environment;
    apiKey;
    fromEmail;
    fromName;
    isActive;
    updatedBy;
    __tag = 'SetupSendgridCommand';
    constructor(environment, apiKey, fromEmail, fromName, isActive, updatedBy) {
        this.environment = environment;
        this.apiKey = apiKey;
        this.fromEmail = fromEmail;
        this.fromName = fromName;
        this.isActive = isActive;
        this.updatedBy = updatedBy;
    }
}
exports.SetupSendgridCommand = SetupSendgridCommand;
class SetupSendgridCommandHandler {
    configRepo;
    cryptoService;
    cacheService;
    constructor(configRepo, cryptoService, cacheService) {
        this.configRepo = configRepo;
        this.cryptoService = cryptoService;
        this.cacheService = cacheService;
    }
    async handle(command) {
        const { environment, apiKey, fromEmail, fromName, isActive, updatedBy } = command;
        if (!environment || !Object.values(client_1.IntegrationEnvironment).includes(environment)) {
            throw new errors_1.BadRequestError('Invalid environment. Expected TEST or LIVE');
        }
        if (!apiKey || !fromEmail || !fromName) {
            throw new errors_1.BadRequestError('Missing required SendGrid credentials');
        }
        const credentials = {
            apiKey,
            fromEmail,
            fromName
        };
        const encrypted = this.cryptoService.encryptCredentials(credentials);
        const config = await this.configRepo.upsertIntegration(client_1.IntegrationService.SENDGRID, {
            environment,
            credentials: encrypted,
            isActive,
            updatedBy,
        });
        await this.cacheService.del(`configs:integrations:${client_1.IntegrationService.SENDGRID}`);
        return config;
    }
}
exports.SetupSendgridCommandHandler = SetupSendgridCommandHandler;
