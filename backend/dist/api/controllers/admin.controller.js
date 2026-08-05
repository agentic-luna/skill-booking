"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const prisma_1 = require("../../config/prisma");
const di_container_1 = require("../di-container");
const client_1 = require("@prisma/client");
const get_configs_1 = require("../../application/use-cases/admin/get-configs");
const update_config_1 = require("../../application/use-cases/admin/update-config");
const broadcast_notification_1 = require("../../application/use-cases/admin/broadcast-notification");
const get_ledger_1 = require("../../application/use-cases/admin/get-ledger");
const payout_host_1 = require("../../application/use-cases/admin/payout-host");
const admin_login_1 = require("../../application/use-cases/admin/admin-login");
const approve_event_1 = require("../../application/use-cases/events/approve-event");
const review_kyc_1 = require("../../application/use-cases/admin/review-kyc");
const socket_1 = require("../../config/socket");
const api_response_1 = require("../common/api-response");
const errors_1 = require("../common/errors");
const pagination_1 = require("../common/pagination");
const templates_1 = require("../../constants/templates");
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
            const { page, limit, skip } = (0, pagination_1.parsePaginationParams)(req.query, 20);
            const status = req.query.status;
            const filters = status ? { status } : {};
            const [logs, total] = await Promise.all([
                di_container_1.notificationRepo.findMany(filters, skip, limit),
                di_container_1.notificationRepo.count(filters),
            ]);
            const paginated = (0, pagination_1.buildPaginatedResponse)(logs, total, page, limit);
            return api_response_1.ApiResponse.success(res, {
                logs: paginated.data,
                total: paginated.pagination.total,
                page: paginated.pagination.page,
                limit: paginated.pagination.limit,
                totalPages: paginated.pagination.totalPages,
                pagination: paginated.pagination,
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
            const { mode, manualRef } = req.body || {};
            const result = await di_container_1.mediator.send(new payout_host_1.PayoutHostCommand(hostId, mode, manualRef));
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
            const { page, limit } = (0, pagination_1.parsePaginationParams)(req.query, 10);
            const result = await di_container_1.mediator.send(new review_kyc_1.GetAllHostsQuery(kycStatus, page, limit));
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
            const { page, limit, skip } = (0, pagination_1.parsePaginationParams)(req.query, 10);
            const [refundRequests, total] = await Promise.all([
                prisma_1.prisma.refundRequest.findMany({
                    skip,
                    take: limit,
                    include: {
                        booking: {
                            include: {
                                client: true,
                                event: true,
                            },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                }),
                prisma_1.prisma.refundRequest.count(),
            ]);
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
            const paginated = (0, pagination_1.buildPaginatedResponse)(mapped, total, page, limit);
            return api_response_1.ApiResponse.success(res, paginated);
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
                include: {
                    booking: {
                        include: {
                            event: {
                                include: {
                                    commission: true,
                                },
                            },
                        },
                    },
                },
            });
            if (!refundRequest) {
                throw new errors_1.BadRequestError('Refund request not found');
            }
            if (refundRequest.status === 'APPROVED') {
                throw new errors_1.BadRequestError('Refund request is already approved.');
            }
            const booking = refundRequest.booking;
            const event = booking.event;
            const refundAmount = Number(refundRequest.refundAmount);
            if (refundAmount > 0) {
                // Trigger payment gateway refund
                const ledgers = await di_container_1.ledgerRepo.findMany({
                    bookingId: booking.id,
                    type: client_1.LedgerTxnType.PAYMENT_CAPTURE,
                });
                const paymentLedger = ledgers.find((l) => l.status === client_1.LedgerStatus.HELD);
                if (!paymentLedger) {
                    throw new errors_1.BadRequestError('Held payment ledger record not found for this booking.');
                }
                const refundResult = await di_container_1.paymentGatewayProvider.initiateRefund(paymentLedger.gatewayTxnId, refundAmount, { bookingId: booking.id, bookingRef: booking.bookingRef });
                const commissionPct = event.commission?.commissionType === client_1.CommissionType.PERCENTAGE
                    ? Number(event.commission.platformValue) / 100
                    : 0.1; // Default 10%
                const lostHostLiability = refundAmount * (1 - commissionPct);
                const lostPlatformRevenue = refundAmount * commissionPct;
                // Register REFUND ledger log
                await di_container_1.ledgerRepo.create({
                    bookingId: booking.id,
                    gatewayTxnId: refundResult.refundId,
                    type: client_1.LedgerTxnType.REFUND,
                    amountCaptured: -refundAmount,
                    platformRevenue: -lostPlatformRevenue,
                    hostLiability: -lostHostLiability,
                    status: client_1.LedgerStatus.REFUNDED_TO_CLIENT,
                });
                // Update payment ledger status
                await di_container_1.ledgerRepo.update(paymentLedger.id, {
                    status: client_1.LedgerStatus.REFUNDED_TO_CLIENT,
                });
            }
            const [updatedRequest, updatedBooking] = await prisma_1.prisma.$transaction([
                prisma_1.prisma.refundRequest.update({
                    where: { id },
                    data: { status: 'APPROVED' },
                }),
                prisma_1.prisma.booking.update({
                    where: { id: refundRequest.bookingId },
                    data: { status: client_1.BookingStatus.REFUNDED },
                }),
            ]);
            // Dispatch notifications to client
            try {
                const clientUser = await prisma_1.prisma.user.findUnique({ where: { id: booking.clientId } });
                if (clientUser) {
                    const clientName = `${clientUser.firstName} ${clientUser.lastName}`;
                    const refundData = {
                        clientName,
                        bookingId: booking.id,
                        eventTitle: event.title,
                        refundAmount,
                        status: 'APPROVED',
                    };
                    const emailContent = (0, templates_1.generateRefundApprovedEmailTemplate)(refundData);
                    const whatsappContent = (0, templates_1.generateRefundApprovedWhatsAppTemplate)(refundData);
                    const inAppContent = (0, templates_1.generateRefundApprovedInAppTemplate)(refundData);
                    const notificationTargets = [];
                    notificationTargets.push({
                        channel: client_1.DeliveryChannel.IN_APP,
                        recipient: clientUser.email || clientUser.id,
                        content: inAppContent,
                    });
                    if (clientUser.email) {
                        notificationTargets.push({
                            channel: client_1.DeliveryChannel.EMAIL,
                            recipient: clientUser.email,
                            content: emailContent,
                        });
                    }
                    if (clientUser.phone) {
                        notificationTargets.push({
                            channel: client_1.DeliveryChannel.WHATSAPP,
                            recipient: clientUser.phone,
                            content: whatsappContent,
                        });
                    }
                    for (const target of notificationTargets) {
                        const log = await prisma_1.prisma.notificationLog.create({
                            data: {
                                userId: clientUser.id,
                                channel: target.channel,
                                triggerEvent: 'REFUND_SUCCESS',
                                recipient: target.recipient,
                                content: target.content,
                                status: target.channel === client_1.DeliveryChannel.IN_APP ? client_1.NotificationStatus.SENT : client_1.NotificationStatus.PENDING,
                                sentAt: target.channel === client_1.DeliveryChannel.IN_APP ? new Date() : null,
                            }
                        });
                        if (target.channel !== client_1.DeliveryChannel.IN_APP) {
                            await di_container_1.queueService.addNotificationJob(log.id);
                        }
                    }
                }
            }
            catch (err) {
                // Silent catch for notification dispatch errors
            }
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
            const { reason } = req.body;
            const refundRequest = await prisma_1.prisma.refundRequest.findUnique({
                where: { id },
                include: {
                    booking: {
                        include: {
                            event: true,
                        }
                    }
                }
            });
            const updated = await prisma_1.prisma.refundRequest.update({
                where: { id },
                data: { status: 'DECLINED' },
            });
            // Dispatch notifications to client
            if (refundRequest?.booking) {
                try {
                    const booking = refundRequest.booking;
                    const clientUser = await prisma_1.prisma.user.findUnique({ where: { id: booking.clientId } });
                    if (clientUser) {
                        const clientName = `${clientUser.firstName} ${clientUser.lastName}`;
                        const refundData = {
                            clientName,
                            bookingId: booking.id,
                            eventTitle: booking.event?.title || 'Training Workshop',
                            status: 'DECLINED',
                            reason,
                        };
                        const emailContent = (0, templates_1.generateRefundDeclinedEmailTemplate)(refundData);
                        const whatsappContent = (0, templates_1.generateRefundDeclinedWhatsAppTemplate)(refundData);
                        const inAppContent = (0, templates_1.generateRefundDeclinedInAppTemplate)(refundData);
                        const notificationTargets = [];
                        notificationTargets.push({
                            channel: client_1.DeliveryChannel.IN_APP,
                            recipient: clientUser.email || clientUser.id,
                            content: inAppContent,
                        });
                        if (clientUser.email) {
                            notificationTargets.push({
                                channel: client_1.DeliveryChannel.EMAIL,
                                recipient: clientUser.email,
                                content: emailContent,
                            });
                        }
                        if (clientUser.phone) {
                            notificationTargets.push({
                                channel: client_1.DeliveryChannel.WHATSAPP,
                                recipient: clientUser.phone,
                                content: whatsappContent,
                            });
                        }
                        for (const target of notificationTargets) {
                            const log = await prisma_1.prisma.notificationLog.create({
                                data: {
                                    userId: clientUser.id,
                                    channel: target.channel,
                                    triggerEvent: 'REFUND_DECLINED',
                                    recipient: target.recipient,
                                    content: target.content,
                                    status: target.channel === client_1.DeliveryChannel.IN_APP ? client_1.NotificationStatus.SENT : client_1.NotificationStatus.PENDING,
                                    sentAt: target.channel === client_1.DeliveryChannel.IN_APP ? new Date() : null,
                                }
                            });
                            if (target.channel !== client_1.DeliveryChannel.IN_APP) {
                                await di_container_1.queueService.addNotificationJob(log.id);
                            }
                        }
                    }
                }
                catch (err) {
                    // Silent catch for notification dispatch errors
                }
            }
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
            const { reason } = req.body;
            const updatedEvent = await prisma_1.prisma.event.update({
                where: { id: eventId },
                data: { status: 'CANCELED' },
                include: {
                    host: {
                        include: { user: true }
                    }
                }
            });
            // Dispatch notifications to host
            if (updatedEvent.host?.user) {
                try {
                    const hostUser = updatedEvent.host.user;
                    const hostName = `${hostUser.firstName} ${hostUser.lastName}`;
                    const declineData = { hostName, eventTitle: updatedEvent.title, reason };
                    const emailContent = (0, templates_1.generateEventDeclineEmailTemplate)(declineData);
                    const whatsappContent = (0, templates_1.generateEventDeclineWhatsAppTemplate)(declineData);
                    const inAppContent = (0, templates_1.generateEventDeclineInAppTemplate)(declineData);
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
                    for (const target of notificationTargets) {
                        const log = await prisma_1.prisma.notificationLog.create({
                            data: {
                                userId: hostUser.id,
                                channel: target.channel,
                                triggerEvent: 'EVENT_DECLINED',
                                recipient: target.recipient,
                                content: target.content,
                                status: target.channel === client_1.DeliveryChannel.IN_APP ? client_1.NotificationStatus.SENT : client_1.NotificationStatus.PENDING,
                                sentAt: target.channel === client_1.DeliveryChannel.IN_APP ? new Date() : null,
                            }
                        });
                        if (target.channel !== client_1.DeliveryChannel.IN_APP) {
                            await di_container_1.queueService.addNotificationJob(log.id);
                        }
                    }
                }
                catch (err) {
                    // Silent catch for notification dispatch errors
                }
            }
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
            const editRequest = await prisma_1.prisma.editRequest.findUnique({
                where: { id },
                include: {
                    event: true,
                    host: {
                        include: {
                            user: true,
                        },
                    },
                },
            });
            if (!editRequest || editRequest.status !== 'PENDING') {
                throw new errors_1.BadRequestError('Invalid or already processed edit request.');
            }
            await prisma_1.prisma.$transaction(async (tx) => {
                // 1. Mark request as APPROVED
                await tx.editRequest.update({
                    where: { id },
                    data: { status: 'APPROVED' },
                });
                // 2. Change Event status to EDIT_MODE so host can edit it
                await tx.event.update({
                    where: { id: editRequest.eventId },
                    data: { status: 'EDIT_MODE' },
                });
            });
            // 3. Dispatch Email & WhatsApp notification to host
            try {
                const hostUser = editRequest.host?.user;
                const event = editRequest.event;
                if (hostUser && event) {
                    const hostName = `${hostUser.firstName} ${hostUser.lastName}`;
                    const approveData = {
                        hostName,
                        eventTitle: event.title,
                        eventId: event.id,
                    };
                    const emailContent = (0, templates_1.generateEditRequestApprovedEmailTemplate)(approveData);
                    const whatsappContent = (0, templates_1.generateEditRequestApprovedWhatsAppTemplate)(approveData);
                    const inAppContent = (0, templates_1.generateEditRequestApprovedInAppTemplate)(approveData);
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
                    for (const target of notificationTargets) {
                        const log = await di_container_1.notificationRepo.create({
                            userId: hostUser.id,
                            channel: target.channel,
                            triggerEvent: 'EDIT_REQUEST_APPROVED',
                            recipient: target.recipient,
                            content: target.content,
                            status: target.channel === client_1.DeliveryChannel.IN_APP ? client_1.NotificationStatus.SENT : client_1.NotificationStatus.PENDING,
                            sentAt: target.channel === client_1.DeliveryChannel.IN_APP ? new Date() : null,
                        });
                        if (target.channel !== client_1.DeliveryChannel.IN_APP) {
                            await di_container_1.queueService.addNotificationJob(log.id);
                        }
                    }
                }
            }
            catch (err) {
                di_container_1.logger.error('[AdminController] Failed to dispatch edit request approval notification:', err);
            }
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
