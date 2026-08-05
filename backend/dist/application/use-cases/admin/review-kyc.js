"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewKycCommandHandler = exports.ReviewKycCommand = exports.GetAllHostsQueryHandler = exports.GetAllHostsQuery = exports.GetPendingKycHostsQueryHandler = exports.GetPendingKycHostsQuery = void 0;
const client_1 = require("@prisma/client");
const errors_1 = require("../../../application/common/errors");
const templates_1 = require("../../../constants/templates");
// ─── List Pending KYC Hosts ──────────────────────────────────────────────────
class GetPendingKycHostsQuery {
    __tag = 'GetPendingKycHostsQuery';
}
exports.GetPendingKycHostsQuery = GetPendingKycHostsQuery;
class GetPendingKycHostsQueryHandler {
    userRepo;
    cryptoService;
    constructor(userRepo, cryptoService) {
        this.userRepo = userRepo;
        this.cryptoService = cryptoService;
    }
    async handle(_query) {
        const hosts = await this.userRepo.findPendingKycHosts();
        const decryptedHosts = hosts.map((h) => this.cryptoService.decryptHost(h));
        return {
            count: decryptedHosts.length,
            hosts: decryptedHosts,
        };
    }
}
exports.GetPendingKycHostsQueryHandler = GetPendingKycHostsQueryHandler;
// ─── List All Hosts ──────────────────────────────────────────────────────────
class GetAllHostsQuery {
    kycStatus;
    page;
    limit;
    __tag = 'GetAllHostsQuery';
    constructor(kycStatus, page, limit) {
        this.kycStatus = kycStatus;
        this.page = page;
        this.limit = limit;
    }
}
exports.GetAllHostsQuery = GetAllHostsQuery;
class GetAllHostsQueryHandler {
    userRepo;
    cryptoService;
    constructor(userRepo, cryptoService) {
        this.userRepo = userRepo;
        this.cryptoService = cryptoService;
    }
    async handle(query) {
        const filters = query.kycStatus ? { kycStatus: query.kycStatus } : undefined;
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
exports.GetAllHostsQueryHandler = GetAllHostsQueryHandler;
// ─── Approve / Reject KYC ────────────────────────────────────────────────────
class ReviewKycCommand {
    hostProfileId;
    decision;
    rejectionReason;
    __tag = 'ReviewKycCommand';
    constructor(hostProfileId, decision, rejectionReason) {
        this.hostProfileId = hostProfileId;
        this.decision = decision;
        this.rejectionReason = rejectionReason;
    }
}
exports.ReviewKycCommand = ReviewKycCommand;
class ReviewKycCommandHandler {
    userRepo;
    cryptoService;
    notificationRepo;
    configRepo;
    queueService;
    constructor(userRepo, cryptoService, notificationRepo, configRepo, queueService) {
        this.userRepo = userRepo;
        this.cryptoService = cryptoService;
        this.notificationRepo = notificationRepo;
        this.configRepo = configRepo;
        this.queueService = queueService;
    }
    async handle(command) {
        const { hostProfileId, decision, rejectionReason } = command;
        if (!hostProfileId) {
            throw new errors_1.BadRequestError('Host profile ID is required');
        }
        if (!['APPROVED', 'REJECTED'].includes(decision)) {
            throw new errors_1.BadRequestError('Decision must be either APPROVED or REJECTED');
        }
        if (decision === 'REJECTED' && !rejectionReason) {
            throw new errors_1.BadRequestError('A rejection reason is required when rejecting a KYC submission');
        }
        const newStatus = decision === 'APPROVED' ? client_1.KycStatus.APPROVED : client_1.KycStatus.REJECTED;
        const updated = await this.userRepo.updateKycStatus(hostProfileId, newStatus, rejectionReason);
        if (!updated) {
            throw new errors_1.NotFoundError('Host profile not found');
        }
        // Trigger notification for KYC verification decision (APPROVED / REJECTED)
        try {
            const hostUser = await this.userRepo.findById(updated.userId);
            if (hostUser) {
                const hostName = `${hostUser.firstName} ${hostUser.lastName}`;
                const kycData = { hostName, status: decision, rejectionReason };
                const emailContent = decision === 'APPROVED'
                    ? (0, templates_1.generateKycApprovedEmailTemplate)(kycData)
                    : (0, templates_1.generateKycRejectedEmailTemplate)(kycData);
                const whatsappContent = decision === 'APPROVED'
                    ? (0, templates_1.generateKycApprovedWhatsAppTemplate)(kycData)
                    : (0, templates_1.generateKycRejectedWhatsAppTemplate)(kycData);
                const inAppContent = decision === 'APPROVED'
                    ? (0, templates_1.generateKycApprovedInAppTemplate)(kycData)
                    : (0, templates_1.generateKycRejectedInAppTemplate)(kycData);
                const notificationTargets = [];
                notificationTargets.push({
                    channel: client_1.DeliveryChannel.IN_APP,
                    recipient: hostUser.email || hostUser.id,
                    content: inAppContent,
                });
                if (hostUser.email) {
                    notificationTargets.push({
                        channel: client_1.DeliveryChannel.EMAIL,
                        recipient: hostUser.email,
                        content: emailContent,
                    });
                }
                if (hostUser.phone) {
                    notificationTargets.push({
                        channel: client_1.DeliveryChannel.WHATSAPP,
                        recipient: hostUser.phone,
                        content: whatsappContent,
                    });
                }
                const triggerEvent = decision === 'APPROVED' ? 'KYC_APPROVED' : client_1.TriggerEvent.KYC_REJECTED;
                for (const target of notificationTargets) {
                    const log = await this.notificationRepo.create({
                        userId: hostUser.id,
                        channel: target.channel,
                        triggerEvent,
                        recipient: target.recipient,
                        content: target.content,
                        status: target.channel === client_1.DeliveryChannel.IN_APP ? client_1.NotificationStatus.SENT : client_1.NotificationStatus.PENDING,
                        sentAt: target.channel === client_1.DeliveryChannel.IN_APP ? new Date() : null,
                    });
                    if (target.channel !== client_1.DeliveryChannel.IN_APP) {
                        await this.queueService.addNotificationJob(log.id);
                    }
                }
            }
        }
        catch (err) {
            // Silent catch for notification dispatch failures
        }
        return {
            message: `KYC ${decision === 'APPROVED' ? 'approved' : 'rejected'} successfully`,
            hostProfile: this.cryptoService.decryptHostProfile(updated),
        };
    }
}
exports.ReviewKycCommandHandler = ReviewKycCommandHandler;
