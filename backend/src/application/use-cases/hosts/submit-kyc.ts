import { AccountType, KycStatus } from '@prisma/client';
import { IUserRepository } from '../../../domain/repositories/user.repository';
import { IRequest, IRequestHandler } from '../../common/mediator';

export class SubmitKycCommand implements IRequest<any> {
  readonly __tag = 'SubmitKycCommand';
  constructor(
    public readonly userId: string,
    public readonly data: {
      accountType: AccountType;
      govIdUrl: string;
      gstNumber?: string;
      bio?: string;
    }
  ) {}
}

export class SubmitKycCommandHandler implements IRequestHandler<SubmitKycCommand, any> {
  constructor(private userRepo: IUserRepository) {}

  async handle(command: SubmitKycCommand): Promise<any> {
    const { userId, data } = command;
    return this.userRepo.upsertHostProfile(userId, {
      ...data,
      kycStatus: KycStatus.PENDING,
    });
  }
}
