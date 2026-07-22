import { IUserRepository } from '../../../domain/repositories/user.repository';
import { ICryptoService } from '../../services/crypto.service';
import { NotFoundError, BadRequestError } from '../../common/errors';
import { IRequest, IRequestHandler } from '../../common/mediator';

export class SubmitBankDetailsCommand implements IRequest<any> {
  readonly __tag = 'SubmitBankDetailsCommand';
  constructor(
    public readonly hostProfileId: string,
    public readonly data: {
      accountHolderName?: string;
      accountNumber?: string;
      ifscCode?: string;
      bankName?: string;
      upiId?: string | null;
    },
    public readonly isUpdate: boolean = false
  ) {}
}

export class SubmitBankDetailsCommandHandler implements IRequestHandler<SubmitBankDetailsCommand, any> {
  constructor(
    private userRepo: IUserRepository,
    private cryptoService: ICryptoService
  ) {}

  async handle(command: SubmitBankDetailsCommand): Promise<any> {
    const { hostProfileId, data, isUpdate } = command;

    if (isUpdate) {
      const existing = await this.userRepo.findHostBankDetail(hostProfileId);
      if (!existing) {
        throw new NotFoundError('Bank details not found. Please submit them first.');
      }

      const updatePayload: any = {};
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
      throw new BadRequestError('Missing required bank details for submission');
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
