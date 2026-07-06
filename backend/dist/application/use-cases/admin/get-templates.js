"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetTemplatesQueryHandler = exports.GetTemplatesQuery = void 0;
class GetTemplatesQuery {
    __tag = 'GetTemplatesQuery';
}
exports.GetTemplatesQuery = GetTemplatesQuery;
class GetTemplatesQueryHandler {
    configRepo;
    constructor(configRepo) {
        this.configRepo = configRepo;
    }
    async handle(query) {
        return this.configRepo.findTemplates();
    }
}
exports.GetTemplatesQueryHandler = GetTemplatesQueryHandler;
