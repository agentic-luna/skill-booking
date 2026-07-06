"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateTemplateCommandHandler = exports.UpdateTemplateCommand = void 0;
class UpdateTemplateCommand {
    templateId;
    data;
    __tag = 'UpdateTemplateCommand';
    constructor(templateId, data) {
        this.templateId = templateId;
        this.data = data;
    }
}
exports.UpdateTemplateCommand = UpdateTemplateCommand;
class UpdateTemplateCommandHandler {
    configRepo;
    constructor(configRepo) {
        this.configRepo = configRepo;
    }
    async handle(command) {
        const { templateId, data } = command;
        return this.configRepo.updateTemplate(templateId, data);
    }
}
exports.UpdateTemplateCommandHandler = UpdateTemplateCommandHandler;
