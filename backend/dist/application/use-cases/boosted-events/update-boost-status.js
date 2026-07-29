"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateBoostStatusCommandHandler = exports.UpdateBoostStatusCommand = void 0;
class UpdateBoostStatusCommand {
    id;
    status;
    __tag = 'UpdateBoostStatusCommand';
    constructor(id, status) {
        this.id = id;
        this.status = status;
    }
}
exports.UpdateBoostStatusCommand = UpdateBoostStatusCommand;
class UpdateBoostStatusCommandHandler {
    boostedRepo;
    constructor(boostedRepo) {
        this.boostedRepo = boostedRepo;
    }
    async handle(command) {
        const isActive = command.status === 'APPROVED';
        return this.boostedRepo.update(command.id, {
            status: command.status,
            isActive
        });
    }
}
exports.UpdateBoostStatusCommandHandler = UpdateBoostStatusCommandHandler;
