"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetupTwilioCommandHandler = exports.SetupTwilioCommand = void 0;
const client_1 = require("@prisma/client");
const errors_1 = require("../../../api/common/errors");
class SetupTwilioCommand {
    environment;
    accountSid;
    authToken;
    fromNumber;
    isActive;
    updatedBy;
    __tag = 'SetupTwilioCommand';
    constructor(environment, accountSid, authToken, fromNumber, isActive, updatedBy) {
        this.environment = environment;
        this.accountSid = accountSid;
        this.authToken = authToken;
        this.fromNumber = fromNumber;
        this.isActive = isActive;
        this.updatedBy = updatedBy;
    }
}
exports.SetupTwilioCommand = SetupTwilioCommand;
class SetupTwilioCommandHandler {
    configRepo;
    cryptoService;
    cacheService;
    constructor(configRepo, cryptoService, cacheService) {
        this.configRepo = configRepo;
        this.cryptoService = cryptoService;
        this.cacheService = cacheService;
    }
    async handle(command) {
        const { environment, accountSid, authToken, fromNumber, isActive, updatedBy } = command;
        if (!accountSid || !authToken || !fromNumber) {
            throw new errors_1.BadRequestError('Missing required Twilio credentials');
        }
        const credentials = {
            accountSid,
            authToken,
            fromNumber
        };
        const encrypted = this.cryptoService.encryptCredentials(credentials);
        const config = await this.configRepo.upsertIntegration(client_1.IntegrationService.TWILIO, {
            environment,
            credentials: encrypted,
            isActive,
            updatedBy,
        });
        await this.cacheService.del(`configs:integrations:${client_1.IntegrationService.TWILIO}`);
        return config;
    }
}
exports.SetupTwilioCommandHandler = SetupTwilioCommandHandler;
