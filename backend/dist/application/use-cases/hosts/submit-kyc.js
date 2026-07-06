"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubmitKycCommandHandler = exports.SubmitKycCommand = void 0;
const client_1 = require("@prisma/client");
class SubmitKycCommand {
    userId;
    data;
    __tag = 'SubmitKycCommand';
    constructor(userId, data) {
        this.userId = userId;
        this.data = data;
    }
}
exports.SubmitKycCommand = SubmitKycCommand;
class SubmitKycCommandHandler {
    userRepo;
    constructor(userRepo) {
        this.userRepo = userRepo;
    }
    async handle(command) {
        const { userId, data } = command;
        return this.userRepo.upsertHostProfile(userId, {
            ...data,
            kycStatus: client_1.KycStatus.PENDING,
        });
    }
}
exports.SubmitKycCommandHandler = SubmitKycCommandHandler;
