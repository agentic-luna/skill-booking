import { KycStatus } from '@prisma/client';
import { IUserRepository } from '../../../domain/repositories/user.repository';
import { IRequest, IRequestHandler } from '../../common/mediator';
import { BadRequestError, NotFoundError } from '../../../application/common/errors';

// ─── List Pending KYC Hosts ──────────────────────────────────────────────────

export class GetPendingKycHostsQuery implements IRequest<any> {
  readonly __tag = 'GetPendingKycHostsQuery';
}

export class GetPendingKycHostsQueryHandler implements IRequestHandler<GetPendingKycHostsQuery, any> {
  constructor(private userRepo: IUserRepository) {}

  async handle(_query: GetPendingKycHostsQuery): Promise<any> {
    const hosts = await this.userRepo.findPendingKycHosts();
    return {
      count: hosts.length,
      hosts,
    };
  }
}

// ─── List All Hosts ──────────────────────────────────────────────────────────

export class GetAllHostsQuery implements IRequest<any> {
  readonly __tag = 'GetAllHostsQuery';
  constructor(public readonly kycStatus?: 'PENDING' | 'APPROVED' | 'REJECTED') {}
}

export class GetAllHostsQueryHandler implements IRequestHandler<GetAllHostsQuery, any> {
  constructor(private userRepo: IUserRepository) {}

  async handle(query: GetAllHostsQuery): Promise<any> {
    const filters = query.kycStatus ? { kycStatus: query.kycStatus as any } : undefined;
    const hosts = await this.userRepo.findAllHosts(filters);
    return {
      count: hosts.length,
      hosts,
    };
  }
}

// ─── Approve / Reject KYC ────────────────────────────────────────────────────

export class ReviewKycCommand implements IRequest<any> {
  readonly __tag = 'ReviewKycCommand';
  constructor(
    public readonly hostProfileId: string,
    public readonly decision: 'APPROVED' | 'REJECTED',
    public readonly rejectionReason?: string
  ) {}
}

export class ReviewKycCommandHandler implements IRequestHandler<ReviewKycCommand, any> {
  constructor(private userRepo: IUserRepository) {}

  async handle(command: ReviewKycCommand): Promise<any> {
    const { hostProfileId, decision, rejectionReason } = command;

    if (!hostProfileId) {
      throw new BadRequestError('Host profile ID is required');
    }

    if (!['APPROVED', 'REJECTED'].includes(decision)) {
      throw new BadRequestError('Decision must be either APPROVED or REJECTED');
    }

    if (decision === 'REJECTED' && !rejectionReason) {
      throw new BadRequestError('A rejection reason is required when rejecting a KYC submission');
    }

    const newStatus = decision === 'APPROVED' ? KycStatus.APPROVED : KycStatus.REJECTED;
    const updated = await this.userRepo.updateKycStatus(hostProfileId, newStatus, rejectionReason);

    if (!updated) {
      throw new NotFoundError('Host profile not found');
    }

    return {
      message: `KYC ${decision === 'APPROVED' ? 'approved' : 'rejected'} successfully`,
      hostProfile: updated,
    };
  }
}
