import { KycStatus } from '@prisma/client';
import { IUserRepository } from '../../../domain/repositories/user.repository';
import { ICryptoService } from '../../services/crypto.service';
import { IRequest, IRequestHandler } from '../../common/mediator';
import { BadRequestError, NotFoundError } from '../../../application/common/errors';

// ─── List Pending KYC Hosts ──────────────────────────────────────────────────

export class GetPendingKycHostsQuery implements IRequest<any> {
  readonly __tag = 'GetPendingKycHostsQuery';
}

export class GetPendingKycHostsQueryHandler implements IRequestHandler<GetPendingKycHostsQuery, any> {
  constructor(
    private userRepo: IUserRepository,
    private cryptoService: ICryptoService
  ) {}

  async handle(_query: GetPendingKycHostsQuery): Promise<any> {
    const hosts = await this.userRepo.findPendingKycHosts();
    const decryptedHosts = hosts.map((h) => this.cryptoService.decryptHost(h));
    return {
      count: decryptedHosts.length,
      hosts: decryptedHosts,
    };
  }
}

// ─── List All Hosts ──────────────────────────────────────────────────────────

export class GetAllHostsQuery implements IRequest<any> {
  readonly __tag = 'GetAllHostsQuery';
  constructor(public readonly kycStatus?: 'PENDING' | 'APPROVED' | 'REJECTED') {}
}

export class GetAllHostsQueryHandler implements IRequestHandler<GetAllHostsQuery, any> {
  constructor(
    private userRepo: IUserRepository,
    private cryptoService: ICryptoService
  ) {}

  async handle(query: GetAllHostsQuery): Promise<any> {
    const filters = query.kycStatus ? { kycStatus: query.kycStatus as any } : undefined;
    const hosts = await this.userRepo.findAllHosts(filters);
    const decryptedHosts = hosts.map((h) => this.cryptoService.decryptHost(h));
    return {
      count: decryptedHosts.length,
      hosts: decryptedHosts,
    };
  }
}

// ─── Approve / Reject KYC ────────────────────────────────────────────────────

export class ReviewKycCommand implements IRequest<any> {
  readonly __tag = 'ReviewKycCommand';
  constructor(
    public readonly hostProfileId: string,
    public readonly decision: 'APPROVED' | 'REJECTED' | 'ACCEPT_UNLOCK' | 'REJECT_UNLOCK',
    public readonly rejectionReason?: string
  ) {}
}

export class ReviewKycCommandHandler implements IRequestHandler<ReviewKycCommand, any> {
  constructor(
    private userRepo: IUserRepository,
    private cryptoService: ICryptoService
  ) {}

  async handle(command: ReviewKycCommand): Promise<any> {
    const { hostProfileId, decision, rejectionReason } = command;

    if (!hostProfileId) {
      throw new BadRequestError('Host profile ID is required');
    }

    if (!['APPROVED', 'REJECTED', 'ACCEPT_UNLOCK', 'REJECT_UNLOCK'].includes(decision)) {
      throw new BadRequestError('Decision must be APPROVED, REJECTED, ACCEPT_UNLOCK, or REJECT_UNLOCK');
    }

    if (decision === 'REJECTED' && !rejectionReason) {
      throw new BadRequestError('A rejection reason is required when rejecting a KYC submission');
    }

    let updated;
    if (decision === 'ACCEPT_UNLOCK') {
      updated = await this.userRepo.updateKycUnlockStatus(hostProfileId, KycStatus.REJECTED, false, rejectionReason || 'Unlocked for edits');
    } else if (decision === 'REJECT_UNLOCK') {
      updated = await this.userRepo.updateKycUnlockStatus(hostProfileId, KycStatus.APPROVED, false, 'Unlock request denied');
    } else {
      const newStatus = decision === 'APPROVED' ? KycStatus.APPROVED : KycStatus.REJECTED;
      updated = await this.userRepo.updateKycStatus(hostProfileId, newStatus, rejectionReason);
    }

    if (!updated) {
      throw new NotFoundError('Host profile not found');
    }

    return {
      message: `KYC ${decision === 'APPROVED' ? 'approved' : 'rejected'} successfully`,
      hostProfile: this.cryptoService.decryptHostProfile(updated),
    };
  }
}
