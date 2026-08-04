"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewKycCommandHandler = exports.ReviewKycCommand = exports.GetAllHostsQueryHandler = exports.GetAllHostsQuery = exports.GetPendingKycHostsQueryHandler = exports.GetPendingKycHostsQuery = void 0;
const client_1 = require("@prisma/client");
const errors_1 = require("../../../application/common/errors");
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
    __tag = 'GetAllHostsQuery';
    constructor(kycStatus) {
        this.kycStatus = kycStatus;
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
        const hosts = await this.userRepo.findAllHosts(filters);
        const decryptedHosts = hosts.map((h) => this.cryptoService.decryptHost(h));
        return {
            count: decryptedHosts.length,
            hosts: decryptedHosts,
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
        // Trigger notification for KYC rejection
        if (decision === 'REJECTED') {
            try {
                const hostUser = await this.userRepo.findById(updated.userId);
                if (hostUser) {
                    const templates = await this.configRepo.findTemplates({
                        triggerEvent: 'KYC_REJECTED',
                        isActive: true,
                    });
                    for (const temp of templates) {
                        let content = temp.bodyContent;
                        const userName = `${hostUser.firstName} ${hostUser.lastName}`;
                        const replacements = {
                            '{{userName}}': userName,
                            '{{rejectionReason}}': rejectionReason || '',
                        };
                        for (const [placeholder, value] of Object.entries(replacements)) {
                            content = content.replace(new RegExp(placeholder, 'g'), value);
                        }
                        const recipient = temp.channel === 'EMAIL' ? hostUser.email : hostUser.phone;
                        if (recipient) {
                            const log = await this.notificationRepo.create({
                                userId: hostUser.id,
                                channel: temp.channel,
                                triggerEvent: 'KYC_REJECTED',
                                recipient,
                                content,
                                status: temp.channel === 'IN_APP' ? 'SENT' : 'PENDING',
                                sentAt: temp.channel === 'IN_APP' ? new Date() : null,
                            });
                            if (temp.channel !== 'IN_APP') {
                                await this.queueService.addNotificationJob(log.id);
                            }
                        }
                    }
                }
            }
            catch (err) {
                // Silent catch for notification dispatch failures
            }
        }
        return {
            message: `KYC ${decision === 'APPROVED' ? 'approved' : 'rejected'} successfully`,
            hostProfile: this.cryptoService.decryptHostProfile(updated),
        };
    }
}
exports.ReviewKycCommandHandler = ReviewKycCommandHandler;
