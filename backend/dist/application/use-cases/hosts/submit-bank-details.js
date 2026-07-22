"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubmitBankDetailsCommandHandler = exports.SubmitBankDetailsCommand = void 0;
const errors_1 = require("../../common/errors");
class SubmitBankDetailsCommand {
    hostProfileId;
    data;
    isUpdate;
    __tag = 'SubmitBankDetailsCommand';
    constructor(hostProfileId, data, isUpdate = false) {
        this.hostProfileId = hostProfileId;
        this.data = data;
        this.isUpdate = isUpdate;
    }
}
exports.SubmitBankDetailsCommand = SubmitBankDetailsCommand;
class SubmitBankDetailsCommandHandler {
    userRepo;
    cryptoService;
    constructor(userRepo, cryptoService) {
        this.userRepo = userRepo;
        this.cryptoService = cryptoService;
    }
    async handle(command) {
        const { hostProfileId, data, isUpdate } = command;
        if (isUpdate) {
            const existing = await this.userRepo.findHostBankDetail(hostProfileId);
            if (!existing) {
                throw new errors_1.NotFoundError('Bank details not found. Please submit them first.');
            }
            const updatePayload = {};
            if (data.accountHolderName) {
                updatePayload.accountHolderName = this.cryptoService.encrypt(data.accountHolderName);
            }
            if (data.accountNumber) {
                updatePayload.accountNumber = this.cryptoService.encrypt(data.accountNumber);
            }
            if (data.ifscCode) {
                updatePayload.ifscCode = this.cryptoService.encrypt(data.ifscCode);
            }
            if (data.bankName) {
                updatePayload.bankName = data.bankName;
            }
            if (data.upiId !== undefined) {
                updatePayload.upiId = data.upiId ? this.cryptoService.encrypt(data.upiId) : null;
            }
            const updated = await this.userRepo.updateHostBankDetail(hostProfileId, updatePayload);
            return this.cryptoService.decryptBankDetail(updated);
        }
        // Overwriting or initial submission
        if (!data.accountHolderName || !data.accountNumber || !data.ifscCode || !data.bankName) {
            throw new errors_1.BadRequestError('Missing required bank details for submission');
        }
        const payload = {
            accountHolderName: this.cryptoService.encrypt(data.accountHolderName),
            accountNumber: this.cryptoService.encrypt(data.accountNumber),
            ifscCode: this.cryptoService.encrypt(data.ifscCode),
            bankName: data.bankName,
            upiId: data.upiId ? this.cryptoService.encrypt(data.upiId) : null,
        };
        const upserted = await this.userRepo.upsertHostBankDetail(hostProfileId, payload);
        return this.cryptoService.decryptBankDetail(upserted);
    }
}
exports.SubmitBankDetailsCommandHandler = SubmitBankDetailsCommandHandler;
