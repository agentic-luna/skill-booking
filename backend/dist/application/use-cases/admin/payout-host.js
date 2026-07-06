"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayoutHostCommandHandler = exports.PayoutHostCommand = void 0;
const errors_1 = require("../../common/errors");
class PayoutHostCommand {
    hostId;
    __tag = 'PayoutHostCommand';
    constructor(hostId) {
        this.hostId = hostId;
    }
}
exports.PayoutHostCommand = PayoutHostCommand;
class PayoutHostCommandHandler {
    userRepo;
    ledgerRepo;
    cryptoService;
    commsService;
    constructor(userRepo, ledgerRepo, cryptoService, commsService) {
        this.userRepo = userRepo;
        this.ledgerRepo = ledgerRepo;
        this.cryptoService = cryptoService;
        this.commsService = commsService;
    }
    async handle(command) {
        const { hostId } = command;
        const hostProfile = await this.userRepo.findHostProfileByUserId(hostId);
        if (!hostProfile) {
            throw new errors_1.NotFoundError('Host profile not found');
        }
        const bankDetail = await this.userRepo.findHostBankDetail(hostProfile.id);
        if (!bankDetail) {
            throw new errors_1.BadRequestError('Host bank details are missing');
        }
        const ledgers = await this.ledgerRepo.findPendingHostPayouts(hostProfile.id);
        if (ledgers.length === 0) {
            return { success: false, message: 'No pending escrow payouts found for this Host' };
        }
        const decryptedHolderName = this.cryptoService.decrypt(bankDetail.accountHolderName);
        const decryptedAccountNumber = this.cryptoService.decrypt(bankDetail.accountNumber);
        const decryptedIfscCode = this.cryptoService.decrypt(bankDetail.ifscCode);
        const totalPayout = ledgers.reduce((acc, l) => acc + Number(l.hostLiability), 0);
        const payoutResult = await this.commsService.transferPayout({
            accountHolderName: decryptedHolderName,
            accountNumber: decryptedAccountNumber,
            ifscCode: decryptedIfscCode,
            bankName: bankDetail.bankName,
        }, totalPayout);
        if (payoutResult.success) {
            const ledgerIds = ledgers.map((l) => l.id);
            await this.ledgerRepo.updateMany(ledgerIds, { status: 'RELEASED_TO_HOST' });
            return {
                success: true,
                amount: totalPayout,
                payoutId: payoutResult.payoutId,
                transactionsPaid: ledgerIds.length,
            };
        }
        else {
            const err = new Error('Razorpay Payout API call failed');
            err.statusCode = 502;
            throw err;
        }
    }
}
exports.PayoutHostCommandHandler = PayoutHostCommandHandler;
