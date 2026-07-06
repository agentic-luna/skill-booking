"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetConfigsQueryHandler = exports.GetConfigsQuery = void 0;
class GetConfigsQuery {
    __tag = 'GetConfigsQuery';
}
exports.GetConfigsQuery = GetConfigsQuery;
class GetConfigsQueryHandler {
    configRepo;
    cryptoService;
    constructor(configRepo, cryptoService) {
        this.configRepo = configRepo;
        this.cryptoService = cryptoService;
    }
    async handle(query) {
        const configs = await this.configRepo.findAllIntegrations();
        return configs.map((c) => {
            let credentials = {};
            try {
                const decrypted = this.cryptoService.decryptCredentials(c.credentials);
                credentials = this.maskObj(decrypted);
            }
            catch (err) {
                credentials = { error: 'Failed to decrypt credentials' };
            }
            return {
                ...c,
                credentials,
            };
        });
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
exports.GetConfigsQueryHandler = GetConfigsQueryHandler;
