import { IUserRepository } from '../../../domain/repositories/user.repository';
import { ILedgerRepository } from '../../../domain/repositories/ledger.repository';
import { ICryptoService } from '../../services/crypto.service';
import { ICommunicationService } from '../../services/communication.service';
import { NotFoundError, BadRequestError } from '../../common/errors';
import { IRequest, IRequestHandler } from '../../common/mediator';

export class PayoutHostCommand implements IRequest<any> {
  readonly __tag = 'PayoutHostCommand';
  constructor(public readonly hostId: string) {}
}

export class PayoutHostCommandHandler implements IRequestHandler<PayoutHostCommand, any> {
  constructor(
    private userRepo: IUserRepository,
    private ledgerRepo: ILedgerRepository,
    private cryptoService: ICryptoService,
    private commsService: ICommunicationService
  ) {}

  async handle(command: PayoutHostCommand): Promise<any> {
    const { hostId } = command;

    const hostProfile = await this.userRepo.findHostProfileByUserId(hostId);
    if (!hostProfile) {
      throw new NotFoundError('Host profile not found');
    }

    const bankDetail = await this.userRepo.findHostBankDetail(hostProfile.id);
    if (!bankDetail) {
      throw new BadRequestError('Host bank details are missing');
    }

    const ledgers = await this.ledgerRepo.findPendingHostPayouts(hostProfile.id);
    if (ledgers.length === 0) {
      return { success: false, message: 'No pending escrow payouts found for this Host' };
    }

    const decryptedHolderName = this.cryptoService.decrypt(bankDetail.accountHolderName);
    const decryptedAccountNumber = this.cryptoService.decrypt(bankDetail.accountNumber);
    const decryptedIfscCode = this.cryptoService.decrypt(bankDetail.ifscCode);

    const totalPayout = ledgers.reduce((acc, l) => acc + Number(l.hostLiability), 0);

    const payoutResult = await this.commsService.transferPayout(
      {
        accountHolderName: decryptedHolderName,
        accountNumber: decryptedAccountNumber,
        ifscCode: decryptedIfscCode,
        bankName: bankDetail.bankName,
      },
      totalPayout
    );

    if (payoutResult.success) {
      const ledgerIds = ledgers.map((l) => l.id);
      await this.ledgerRepo.updateMany(ledgerIds, { status: 'RELEASED_TO_HOST' });

      return {
        success: true,
        amount: totalPayout,
        payoutId: payoutResult.payoutId,
        transactionsPaid: ledgerIds.length,
      };
    } else {
      const err = new Error('Razorpay Payout API call failed') as any;
      err.statusCode = 502;
      throw err;
    }
  }
}
