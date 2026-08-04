"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CancelBookingCommandHandler = exports.CancelBookingCommand = void 0;
const client_1 = require("@prisma/client");
const errors_1 = require("../../common/errors");
const prisma_1 = require("../../../config/prisma");
class CancelBookingCommand {
    bookingId;
    userId;
    role;
    reason;
    __tag = 'CancelBookingCommand';
    constructor(bookingId, userId, role, reason) {
        this.bookingId = bookingId;
        this.userId = userId;
        this.role = role;
        this.reason = reason;
    }
}
exports.CancelBookingCommand = CancelBookingCommand;
class CancelBookingCommandHandler {
    bookingRepo;
    eventRepo;
    configRepo;
    ledgerRepo;
    paymentGateway;
    cacheService;
    notificationRepo;
    queueService;
    constructor(bookingRepo, eventRepo, configRepo, ledgerRepo, paymentGateway, cacheService, notificationRepo, queueService) {
        this.bookingRepo = bookingRepo;
        this.eventRepo = eventRepo;
        this.configRepo = configRepo;
        this.ledgerRepo = ledgerRepo;
        this.paymentGateway = paymentGateway;
        this.cacheService = cacheService;
        this.notificationRepo = notificationRepo;
        this.queueService = queueService;
    }
    async handle(command) {
        const { bookingId, userId, role, reason } = command;
        const booking = await this.bookingRepo.findById(bookingId);
        if (!booking) {
            throw new errors_1.NotFoundError('Booking not found');
        }
        if (role === client_1.UserRole.CLIENT && booking.clientId !== userId) {
            throw new errors_1.ForbiddenError('Forbidden. You do not own this booking.');
        }
        if (booking.status === client_1.BookingStatus.CANCELED || booking.status === client_1.BookingStatus.REFUNDED) {
            throw new errors_1.BadRequestError('Booking is already canceled or refunded.');
        }
        const event = booking.event;
        const now = new Date();
        const eventStartTime = new Date(event.startTime);
        const hoursDiff = (eventStartTime.getTime() - now.getTime()) / (1000 * 60 * 60);
        if (event.status === 'COMPLETED' || event.status === 'CANCELED' || hoursDiff <= 0) {
            throw new errors_1.BadRequestError('This event has already started, completed, or been canceled, so this booking cannot be canceled.');
        }
        const totalAmount = Number(booking.totalAmount);
        // Fetch refund matrix setting
        const setting = await this.configRepo.findPlatformSetting('refund_matrix');
        let refundPercentage = 100;
        if (setting && setting.value) {
            const matrix = setting.value;
            if (Array.isArray(matrix)) {
                const sorted = [...matrix].sort((a, b) => b.hoursBefore - a.hoursBefore);
                const matched = sorted.find((r) => hoursDiff >= r.hoursBefore);
                refundPercentage = matched ? matched.refundPercentage : 0;
            }
        }
        const refundAmount = totalAmount * (refundPercentage / 100);
        // Replenish seats
        await this.eventRepo.incrementSeats(event.id, booking.seatCount);
        // Always update status to CANCELED (actual refund happens on Super Admin approval)
        const updatedBooking = await this.bookingRepo.update(bookingId, { status: client_1.BookingStatus.CANCELED });
        // Create a RefundRequest record
        const refundRequest = await prisma_1.prisma.refundRequest.create({
            data: {
                bookingId,
                reason: reason || 'Client cancellation request',
                refundAmount,
                refundPercentage,
                status: refundAmount > 0 ? 'PENDING' : 'APPROVED',
            },
        });
        // Trigger notification for booking cancellation
        try {
            const fullBooking = await this.bookingRepo.findFirstByRef(booking.bookingRef);
            if (fullBooking && fullBooking.client) {
                const client = fullBooking.client;
                const userName = `${client.firstName} ${client.lastName}`;
                const content = `Hi ${userName}, your booking (${booking.bookingRef}) for "${event.title}" has been cancelled.`;
                const channelsToNotify = [];
                if (client.email) {
                    channelsToNotify.push({ channel: 'IN_APP', recipient: client.email });
                    channelsToNotify.push({ channel: 'EMAIL', recipient: client.email });
                }
                else {
                    channelsToNotify.push({ channel: 'IN_APP', recipient: client.id });
                }
                if (client.phone) {
                    channelsToNotify.push({ channel: 'SMS', recipient: client.phone });
                }
                for (const target of channelsToNotify) {
                    const log = await this.notificationRepo.create({
                        userId: client.id,
                        channel: target.channel,
                        triggerEvent: 'BOOKING_CANCELLED',
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
        }
        catch (err) {
            // Silent catch for notification dispatch failures
        }
        // Clear search cache when seats count or booking status changes
        await this.cacheService.delPattern('events:search:*');
        return {
            booking: updatedBooking,
            refundAmount,
            refundPercentage,
            refundRequest,
        };
    }
}
exports.CancelBookingCommandHandler = CancelBookingCommandHandler;
