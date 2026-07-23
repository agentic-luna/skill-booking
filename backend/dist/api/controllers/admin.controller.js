"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const prisma_1 = require("../../config/prisma");
const di_container_1 = require("../di-container");
const get_configs_1 = require("../../application/use-cases/admin/get-configs");
const update_config_1 = require("../../application/use-cases/admin/update-config");
const get_templates_1 = require("../../application/use-cases/admin/get-templates");
const update_template_1 = require("../../application/use-cases/admin/update-template");
const broadcast_notification_1 = require("../../application/use-cases/admin/broadcast-notification");
const get_ledger_1 = require("../../application/use-cases/admin/get-ledger");
const payout_host_1 = require("../../application/use-cases/admin/payout-host");
const admin_login_1 = require("../../application/use-cases/admin/admin-login");
const approve_event_1 = require("../../application/use-cases/events/approve-event");
const review_kyc_1 = require("../../application/use-cases/admin/review-kyc");
const socket_1 = require("../../config/socket");
const api_response_1 = require("../common/api-response");
const errors_1 = require("../common/errors");
class AdminController {
    static async adminLogin(req, res, next) {
        try {
            const { identifier, email, username, password } = req.body;
            const adminIdentifier = identifier || email || username;
            const result = await di_container_1.mediator.send(new admin_login_1.AdminLoginCommand(adminIdentifier, password, req.ip));
            return api_response_1.ApiResponse.success(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    static async getIntegrationConfigs(req, res, next) {
        try {
            const configs = await di_container_1.mediator.send(new get_configs_1.GetConfigsQuery());
            return api_response_1.ApiResponse.success(res, configs);
        }
        catch (error) {
            next(error);
        }
    }
    static async updateIntegrationConfig(req, res, next) {
        try {
            const { serviceName } = req.params;
            const { environment, credentials, isActive } = req.body;
            const updated = await di_container_1.mediator.send(new update_config_1.UpdateConfigCommand(serviceName, environment, credentials, isActive, req.user.id));
            return api_response_1.ApiResponse.success(res, updated);
        }
        catch (error) {
            next(error);
        }
    }
    static async getMessageTemplates(req, res, next) {
        try {
            const templates = await di_container_1.mediator.send(new get_templates_1.GetTemplatesQuery());
            return api_response_1.ApiResponse.success(res, templates);
        }
        catch (error) {
            next(error);
        }
    }
    static async updateMessageTemplate(req, res, next) {
        try {
            const { templateId } = req.params;
            const { bodyContent, variables, isActive, subject } = req.body;
            const updated = await di_container_1.mediator.send(new update_template_1.UpdateTemplateCommand(templateId, {
                bodyContent,
                variables,
                isActive,
                subject,
            }));
            return api_response_1.ApiResponse.success(res, updated);
        }
        catch (error) {
            next(error);
        }
    }
    static async getPlatformSettings(req, res, next) {
        try {
            const settings = await di_container_1.configRepo.findAllPlatformSettings();
            return api_response_1.ApiResponse.success(res, settings);
        }
        catch (error) {
            next(error);
        }
    }
    static async updatePlatformSetting(req, res, next) {
        try {
            const { key, value } = req.body;
            if (!key || value === undefined) {
                throw new errors_1.BadRequestError('Missing key and value parameter');
            }
            const setting = await di_container_1.configRepo.upsertPlatformSetting(key, value);
            await di_container_1.cacheService.del(`configs:platform:${key}`);
            return api_response_1.ApiResponse.success(res, setting);
        }
        catch (error) {
            next(error);
        }
    }
    static async getNotificationLogs(req, res, next) {
        try {
            const page = parseInt(req.query.page || '1', 10);
            const limit = parseInt(req.query.limit || '20', 10);
            const status = req.query.status;
            const skip = (page - 1) * limit;
            const filters = status ? { status } : {};
            const [logs, total] = await Promise.all([
                di_container_1.notificationRepo.findMany(filters, skip, limit),
                di_container_1.notificationRepo.count(filters),
            ]);
            return api_response_1.ApiResponse.success(res, {
                logs,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async broadcastNotification(req, res, next) {
        try {
            const { channel, cohort, targetUserId, triggerEvent, subject, bodyContent } = req.body;
            const result = await di_container_1.mediator.send(new broadcast_notification_1.BroadcastNotificationCommand(channel, cohort, targetUserId, triggerEvent || 'BROADCAST', subject, bodyContent));
            return api_response_1.ApiResponse.success(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    static async getEventQueue(req, res, next) {
        try {
            const queue = await di_container_1.eventRepo.findPendingEvents();
            return api_response_1.ApiResponse.success(res, queue);
        }
        catch (error) {
            next(error);
        }
    }
    static async approveEvent(req, res, next) {
        try {
            const { eventId } = req.params;
            const { commissionType, platformValue } = req.body;
            const result = (await di_container_1.mediator.send(new approve_event_1.ApproveEventCommand(eventId, commissionType, Number(platformValue))));
            try {
                (0, socket_1.getIO)().emit('event_approved', {
                    id: result.event.id,
                    title: result.event.title,
                    startTime: result.event.startTime,
                });
            }
            catch (e) {
                di_container_1.logger.warn('[Socket] Failed to broadcast event approval:', e);
            }
            return api_response_1.ApiResponse.success(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    static async getFinanceLedger(req, res, next) {
        try {
            const ledger = await di_container_1.mediator.send(new get_ledger_1.GetLedgerQuery());
            return api_response_1.ApiResponse.success(res, ledger);
        }
        catch (error) {
            next(error);
        }
    }
    static async payoutHost(req, res, next) {
        try {
            const { hostId } = req.params;
            const result = await di_container_1.mediator.send(new payout_host_1.PayoutHostCommand(hostId));
            return api_response_1.ApiResponse.success(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    static async getPendingKycHosts(req, res, next) {
        try {
            const result = await di_container_1.mediator.send(new review_kyc_1.GetPendingKycHostsQuery());
            return api_response_1.ApiResponse.success(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    static async getAllHosts(req, res, next) {
        try {
            const { kycStatus } = req.query;
            const result = await di_container_1.mediator.send(new review_kyc_1.GetAllHostsQuery(kycStatus));
            return api_response_1.ApiResponse.success(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    static async reviewKyc(req, res, next) {
        try {
            const { hostProfileId } = req.params;
            const { decision, rejectionReason } = req.body;
            const result = await di_container_1.mediator.send(new review_kyc_1.ReviewKycCommand(hostProfileId, decision, rejectionReason));
            return api_response_1.ApiResponse.success(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    static async getRefundRequests(req, res, next) {
        try {
            const refundRequests = await prisma_1.prisma.refundRequest.findMany({
                include: {
                    booking: {
                        include: {
                            client: true,
                            event: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
            });
            const mapped = refundRequests.map((r) => ({
                id: r.id,
                clientName: `${r.booking.client.firstName} ${r.booking.client.lastName}`,
                email: r.booking.client.email,
                eventTitle: r.booking.event.title,
                bookingRef: r.booking.bookingRef,
                amount: String(r.booking.totalAmount),
                reason: r.reason || '',
                status: r.status,
                dateRequested: r.createdAt.toISOString().split('T')[0],
            }));
            return api_response_1.ApiResponse.success(res, mapped);
        }
        catch (error) {
            next(error);
        }
    }
    static async approveRefundRequest(req, res, next) {
        try {
            const { id } = req.params;
            const refundRequest = await prisma_1.prisma.refundRequest.findUnique({
                where: { id },
                include: { booking: true },
            });
            if (!refundRequest) {
                throw new errors_1.BadRequestError('Refund request not found');
            }
            const [updatedRequest, updatedBooking] = await prisma_1.prisma.$transaction([
                prisma_1.prisma.refundRequest.update({
                    where: { id },
                    data: { status: 'APPROVED' },
                }),
                prisma_1.prisma.booking.update({
                    where: { id: refundRequest.bookingId },
                    data: { status: 'REFUNDED' },
                }),
                prisma_1.prisma.transactionLedger.updateMany({
                    where: { bookingId: refundRequest.bookingId },
                    data: { status: 'REFUNDED_TO_CLIENT' },
                }),
            ]);
            return api_response_1.ApiResponse.success(res, {
                message: 'Refund request approved successfully',
                refundRequest: updatedRequest,
                booking: updatedBooking,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async declineRefundRequest(req, res, next) {
        try {
            const { id } = req.params;
            const updated = await prisma_1.prisma.refundRequest.update({
                where: { id },
                data: { status: 'DECLINED' },
            });
            return api_response_1.ApiResponse.success(res, {
                message: 'Refund request declined successfully',
                refundRequest: updated,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async deleteHost(req, res, next) {
        try {
            const { id } = req.params;
            const updatedUser = await prisma_1.prisma.user.update({
                where: { id },
                data: { deletedAt: new Date() },
            });
            return api_response_1.ApiResponse.success(res, {
                message: 'Host soft-deleted successfully',
                user: updatedUser,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async notifyHost(req, res, next) {
        try {
            const { id } = req.params;
            const { subject, bodyContent } = req.body;
            if (!subject || !bodyContent) {
                throw new errors_1.BadRequestError('Subject and message content are required');
            }
            const host = await prisma_1.prisma.user.findUnique({ where: { id } });
            if (!host || !host.email) {
                throw new errors_1.BadRequestError('Host not found or host does not have an email address');
            }
            const log = await prisma_1.prisma.notificationLog.create({
                data: {
                    userId: host.id,
                    channel: 'EMAIL',
                    triggerEvent: 'ADMIN_DIRECT',
                    recipient: host.email,
                    content: bodyContent,
                    status: 'PENDING',
                },
            });
            try {
                await di_container_1.commsService.sendEmail(host.email, subject, bodyContent);
                await prisma_1.prisma.notificationLog.update({
                    where: { id: log.id },
                    data: { status: 'SENT', sentAt: new Date() },
                });
            }
            catch (err) {
                await prisma_1.prisma.notificationLog.update({
                    where: { id: log.id },
                    data: { status: 'FAILED', errorMessage: err.message },
                });
                di_container_1.logger.error(`[AdminNotify] Failed to dispatch email to host ${host.email}:`, err);
            }
            return api_response_1.ApiResponse.success(res, {
                message: 'Notification sent successfully',
                log,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async declineEvent(req, res, next) {
        try {
            const { eventId } = req.params;
            const updatedEvent = await prisma_1.prisma.event.update({
                where: { id: eventId },
                data: { status: 'CANCELED' },
            });
            return api_response_1.ApiResponse.success(res, {
                message: 'Program listing declined successfully',
                event: updatedEvent,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getEditRequests(req, res, next) {
        try {
            const requests = await prisma_1.prisma.editRequest.findMany({
                where: { status: 'PENDING' },
                include: {
                    event: true,
                    host: { include: { user: true } }
                },
                orderBy: { createdAt: 'desc' }
            });
            return api_response_1.ApiResponse.success(res, requests);
        }
        catch (error) {
            next(error);
        }
    }
    static async approveEditRequest(req, res, next) {
        try {
            const { id } = req.params;
            const editRequest = await prisma_1.prisma.editRequest.findUnique({ where: { id } });
            if (!editRequest || editRequest.status !== 'PENDING') {
                throw new errors_1.BadRequestError('Invalid or already processed edit request.');
            }
            await prisma_1.prisma.$transaction(async (tx) => {
                // 1. Mark request as APPROVED
                await tx.editRequest.update({
                    where: { id },
                    data: { status: 'APPROVED' }
                });
                // 2. Change Event status back to PENDING so host can edit it
                await tx.event.update({
                    where: { id: editRequest.eventId },
                    data: { status: 'PENDING' }
                });
            });
            return api_response_1.ApiResponse.success(res, { message: 'Edit request approved. Event is now unlocked.' });
        }
        catch (error) {
            next(error);
        }
    }
    static async rejectEditRequest(req, res, next) {
        try {
            const { id } = req.params;
            const editRequest = await prisma_1.prisma.editRequest.findUnique({ where: { id } });
            if (!editRequest || editRequest.status !== 'PENDING') {
                throw new errors_1.BadRequestError('Invalid or already processed edit request.');
            }
            await prisma_1.prisma.editRequest.update({
                where: { id },
                data: { status: 'REJECTED' }
            });
            return api_response_1.ApiResponse.success(res, { message: 'Edit request rejected.' });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AdminController = AdminController;
