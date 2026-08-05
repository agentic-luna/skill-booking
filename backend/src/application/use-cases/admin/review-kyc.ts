import { KycStatus, DeliveryChannel, NotificationStatus, TriggerEvent } from '@prisma/client';
import { IUserRepository } from '../../../domain/repositories/user.repository';
import { ICryptoService } from '../../services/crypto.service';
import { IRequest, IRequestHandler } from '../../common/mediator';
import { IConfigRepository } from '../../../domain/repositories/config.repository';
import { INotificationRepository } from '../../../domain/repositories/notification.repository';
import { IQueueService } from '../../../application/services/queue.service';
import { BadRequestError, NotFoundError } from '../../../application/common/errors';
import {
  generateKycApprovedEmailTemplate,
  generateKycRejectedEmailTemplate,
  generateKycApprovedWhatsAppTemplate,
  generateKycRejectedWhatsAppTemplate,
  generateKycApprovedInAppTemplate,
  generateKycRejectedInAppTemplate,
} from '../../../constants/templates';

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
  constructor(
    public readonly kycStatus?: 'PENDING' | 'APPROVED' | 'REJECTED',
    public readonly page?: number,
    public readonly limit?: number
  ) {}
}

export class GetAllHostsQueryHandler implements IRequestHandler<GetAllHostsQuery, any> {
  constructor(
    private userRepo: IUserRepository,
    private cryptoService: ICryptoService
  ) {}

  async handle(query: GetAllHostsQuery): Promise<any> {
    const filters = query.kycStatus ? { kycStatus: query.kycStatus as any } : undefined;
    const page = query.page && query.page > 0 ? query.page : undefined;
    const limit = query.limit && query.limit > 0 ? query.limit : undefined;
    const skip = page && limit ? (page - 1) * limit : undefined;

    const [hosts, total] = await Promise.all([
      this.userRepo.findAllHosts(filters, skip, limit),
      this.userRepo.countHosts(filters),
    ]);

    const decryptedHosts = hosts.map((h) => this.cryptoService.decryptHost(h));
    const totalPages = limit ? Math.ceil(total / limit) || 1 : 1;

    return {
      count: total,
      total,
      page: page || 1,
      limit: limit || total,
      totalPages,
      hosts: decryptedHosts,
      pagination: {
        total,
        page: page || 1,
        limit: limit || total,
        totalPages,
        hasNextPage: page ? page < totalPages : false,
        hasPrevPage: page ? page > 1 : false,
      },
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

    // Trigger notification for KYC verification decision (APPROVED / REJECTED)
    try {
      const hostUser = await this.userRepo.findById(updated.userId);
      if (hostUser) {
        const hostName = `${hostUser.firstName} ${hostUser.lastName}`;
        const kycData = { hostName, status: decision, rejectionReason };

        const emailContent = decision === 'APPROVED'
          ? generateKycApprovedEmailTemplate(kycData)
          : generateKycRejectedEmailTemplate(kycData);

        const whatsappContent = decision === 'APPROVED'
          ? generateKycApprovedWhatsAppTemplate(kycData)
          : generateKycRejectedWhatsAppTemplate(kycData);

        const inAppContent = decision === 'APPROVED'
          ? generateKycApprovedInAppTemplate(kycData)
          : generateKycRejectedInAppTemplate(kycData);

        const notificationTargets: { channel: DeliveryChannel; recipient: string; content: string }[] = [];

        notificationTargets.push({
          channel: DeliveryChannel.IN_APP,
          recipient: hostUser.email || hostUser.id,
          content: inAppContent,
        });

        if (hostUser.email) {
          notificationTargets.push({
            channel: DeliveryChannel.EMAIL,
            recipient: hostUser.email,
            content: emailContent,
          });
        }

        if (hostUser.phone) {
          notificationTargets.push({
            channel: DeliveryChannel.WHATSAPP,
            recipient: hostUser.phone,
            content: whatsappContent,
          });
        }

        const triggerEvent = decision === 'APPROVED' ? 'KYC_APPROVED' as any : TriggerEvent.KYC_REJECTED;

        for (const target of notificationTargets) {
          const log = await this.notificationRepo.create({
            userId: hostUser.id,
            channel: target.channel,
            triggerEvent,
            recipient: target.recipient,
            content: target.content,
            status: target.channel === DeliveryChannel.IN_APP ? NotificationStatus.SENT : NotificationStatus.PENDING,
            sentAt: target.channel === DeliveryChannel.IN_APP ? new Date() : null,
          });

          if (target.channel !== DeliveryChannel.IN_APP) {
            await this.queueService.addNotificationJob(log.id);
          }
        }
      }
    } catch (err) {
      // Silent catch for notification dispatch failures
    }

    return {
      message: `KYC ${decision === 'APPROVED' ? 'approved' : 'rejected'} successfully`,
      hostProfile: this.cryptoService.decryptHostProfile(updated),
    };
  }
}
