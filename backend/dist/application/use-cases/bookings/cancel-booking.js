"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CancelBookingCommandHandler = exports.CancelBookingCommand = void 0;
const client_1 = require("@prisma/client");
const errors_1 = require("../../common/errors");
class CancelBookingCommand {
    bookingId;
    userId;
    role;
    __tag = 'CancelBookingCommand';
    constructor(bookingId, userId, role) {
        this.bookingId = bookingId;
        this.userId = userId;
        this.role = role;
    }
}
exports.CancelBookingCommand = CancelBookingCommand;
class CancelBookingCommandHandler {
    bookingRepo;
    eventRepo;
    configRepo;
    ledgerRepo;
    paymentGateway;
    constructor(bookingRepo, eventRepo, configRepo, ledgerRepo, paymentGateway) {
        this.bookingRepo = bookingRepo;
        this.eventRepo = eventRepo;
        this.configRepo = configRepo;
        this.ledgerRepo = ledgerRepo;
        this.paymentGateway = paymentGateway;
    }
    async handle(command) {
        const { bookingId, userId, role } = command;
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
        const totalAmount = Number(booking.totalAmount);
        // Fetch refund matrix setting
        const setting = await this.configRepo.findPlatformSetting('refund_matrix');
        let refundPercentage = 100;
        const now = new Date();
        const eventStartTime = new Date(event.startTime);
        const hoursDiff = (eventStartTime.getTime() - now.getTime()) / (1000 * 60 * 60);
        if (hoursDiff <= 0) {
            refundPercentage = 0; // Event started
        }
        else if (setting && setting.value) {
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
        const updatedStatus = refundAmount > 0 ? client_1.BookingStatus.REFUNDED : client_1.BookingStatus.CANCELED;
        const updatedBooking = await this.bookingRepo.update(bookingId, { status: updatedStatus });
        // Handle ledger refund logs and trigger payment gateway refund
        const ledgers = await this.ledgerRepo.findMany({
            bookingId,
            type: client_1.LedgerTxnType.PAYMENT_CAPTURE,
        });
        const paymentLedger = ledgers.find((l) => l.status === client_1.LedgerStatus.HELD);
        if (paymentLedger && refundAmount > 0) {
            // Trigger payment gateway refund
            const refundResult = await this.paymentGateway.initiateRefund(paymentLedger.gatewayTxnId, refundAmount, { bookingId, bookingRef: booking.bookingRef });
            const commissionPct = event.commission?.commissionType === client_1.CommissionType.PERCENTAGE
                ? Number(event.commission.platformValue) / 100
                : 0.1; // Default 10%
            const lostHostLiability = refundAmount * (1 - commissionPct);
            const lostPlatformRevenue = refundAmount * commissionPct;
            // Register REFUND ledger log
            await this.ledgerRepo.create({
                bookingId,
                gatewayTxnId: refundResult.refundId,
                type: client_1.LedgerTxnType.REFUND,
                amountCaptured: -refundAmount,
                platformRevenue: -lostPlatformRevenue,
                hostLiability: -lostHostLiability,
                status: client_1.LedgerStatus.REFUNDED_TO_CLIENT,
            });
            // Update payment ledger status
            await this.ledgerRepo.update(paymentLedger.id, {
                status: client_1.LedgerStatus.REFUNDED_TO_CLIENT,
            });
        }
        return {
            booking: updatedBooking,
            refundAmount,
            refundPercentage,
        };
    }
}
exports.CancelBookingCommandHandler = CancelBookingCommandHandler;
