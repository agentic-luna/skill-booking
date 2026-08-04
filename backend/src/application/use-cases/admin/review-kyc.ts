import { KycStatus } from '@prisma/client';
import { IUserRepository } from '../../../domain/repositories/user.repository';
import { ICryptoService } from '../../services/crypto.service';
import { IRequest, IRequestHandler } from '../../common/mediator';
import { IConfigRepository } from '../../../domain/repositories/config.repository';
import { INotificationRepository } from '../../../domain/repositories/notification.repository';
import { IQueueService } from '../../../application/services/queue.service';
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
    public readonly decision: 'APPROVED' | 'REJECTED',
    public readonly rejectionReason?: string
  ) {}
}

export class ReviewKycCommandHandler implements IRequestHandler<ReviewKycCommand, any> {
  constructor(
    private userRepo: IUserRepository,
    private cryptoService: ICryptoService,
    private notificationRepo: INotificationRepository,
    private configRepo: IConfigRepository,
    private queueService: IQueueService
  ) {}

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

    // Trigger notification for KYC rejection
    if (decision === 'REJECTED') {
      try {
        const hostUser = await this.userRepo.findById(updated.userId);
        if (hostUser) {
          const userName = `${hostUser.firstName} ${hostUser.lastName}`;
          const content = `Hi ${userName}, your KYC verification was rejected. Reason: ${rejectionReason || 'Documents provided were incomplete or invalid.'}`;

          const channelsToNotify: { channel: 'IN_APP' | 'EMAIL' | 'SMS'; recipient: string }[] = [];
          if (hostUser.email) {
            channelsToNotify.push({ channel: 'IN_APP', recipient: hostUser.email });
            channelsToNotify.push({ channel: 'EMAIL', recipient: hostUser.email });
          } else {
            channelsToNotify.push({ channel: 'IN_APP', recipient: hostUser.id });
          }
          if (hostUser.phone) {
            channelsToNotify.push({ channel: 'SMS', recipient: hostUser.phone });
          }

          for (const target of channelsToNotify) {
            const log = await this.notificationRepo.create({
              userId: hostUser.id,
              channel: target.channel as any,
              triggerEvent: 'KYC_REJECTED',
              recipient: target.recipient,
              content,
              status: target.channel === 'IN_APP' ? 'SENT' : 'PENDING',
              sentAt: target.channel === 'IN_APP' ? new Date() : null,
            });

            if (target.channel !== 'IN_APP') {
              await this.queueService.addNotificationJob(log.id);
            }
          }
        }
      } catch (err) {
        // Silent catch for notification dispatch failures
      }
    }

    return {
      message: `KYC ${decision === 'APPROVED' ? 'approved' : 'rejected'} successfully`,
      hostProfile: this.cryptoService.decryptHostProfile(updated),
    };
  }
}
