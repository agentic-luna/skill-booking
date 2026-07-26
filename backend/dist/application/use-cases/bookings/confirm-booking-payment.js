"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfirmBookingPaymentCommandHandler = exports.ConfirmBookingPaymentCommand = void 0;
const client_1 = require("@prisma/client");
const errors_1 = require("../../common/errors");
const commission_parser_1 = require("../../../utils/commission-parser");
class ConfirmBookingPaymentCommand {
    bookingId;
    clientId;
    paymentMethod;
    __tag = 'ConfirmBookingPaymentCommand';
    constructor(bookingId, clientId, paymentMethod) {
        this.bookingId = bookingId;
        this.clientId = clientId;
        this.paymentMethod = paymentMethod;
    }
}
exports.ConfirmBookingPaymentCommand = ConfirmBookingPaymentCommand;
class ConfirmBookingPaymentCommandHandler {
    bookingRepo;
    ledgerRepo;
    configRepo;
    notificationRepo;
    queueService;
    constructor(bookingRepo, ledgerRepo, configRepo, notificationRepo, queueService) {
        this.bookingRepo = bookingRepo;
        this.ledgerRepo = ledgerRepo;
        this.configRepo = configRepo;
        this.notificationRepo = notificationRepo;
        this.queueService = queueService;
    }
    async handle(command) {
        const { bookingId, clientId, paymentMethod } = command;
        const booking = await this.bookingRepo.findById(bookingId);
        if (!booking) {
            throw new errors_1.NotFoundError('Booking record not found.');
        }
        if (booking.clientId !== clientId) {
            throw new errors_1.BadRequestError('You are not authorized to confirm this booking.');
        }
        if (booking.status === client_1.BookingStatus.CONFIRMED) {
            return { success: true, message: 'Booking is already confirmed', booking };
        }
        if (booking.status === client_1.BookingStatus.CANCELED || booking.status === client_1.BookingStatus.REFUNDED) {
            throw new errors_1.BadRequestError(`Cannot confirm payment for a booking with status '${booking.status}'.`);
        }
        const gatewayTxnId = `direct_pay_${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
        // 1. Update Booking status to CONFIRMED
        const updatedBooking = await this.bookingRepo.update(booking.id, {
            status: client_1.BookingStatus.CONFIRMED,
        });
        // 2. Compute platform revenue vs host liability
        const totalAmount = Number(booking.totalAmount);
        let platformRevenue = 0;
        // Use snapshotted commission on booking if available, otherwise fall back to event commission
        const commType = booking.commissionType !== undefined ? booking.commissionType : booking.event?.commission?.commissionType;
        const commValue = booking.platformValue !== undefined ? booking.platformValue : booking.event?.commission?.platformValue;
        if (commType && commValue !== null && commValue !== undefined) {
            if (commType === client_1.CommissionType.PERCENTAGE) {
                platformRevenue = totalAmount * (Number(commValue) / 100);
            }
            else {
                platformRevenue = Number(commValue);
            }
        }
        else {
            let fallbackType = client_1.CommissionType.PERCENTAGE;
            let fallbackValue = 15;
            try {
                const setting = await this.configRepo.findPlatformSetting('commissionRate');
                const parsed = (0, commission_parser_1.parseCommissionRate)(setting?.value);
                fallbackType = parsed.commissionType;
                fallbackValue = parsed.platformValue;
            }
            catch (err) {
                // use default PERCENTAGE 15
            }
            if (fallbackType === client_1.CommissionType.PERCENTAGE) {
                platformRevenue = totalAmount * (fallbackValue / 100);
            }
            else {
                platformRevenue = fallbackValue;
            }
        }
        const hostLiability = totalAmount - platformRevenue;
        // 3. Write Payment capture entry to Transaction Ledger
        const ledgerEntry = await this.ledgerRepo.create({
            bookingId: booking.id,
            gatewayTxnId,
            type: client_1.LedgerTxnType.PAYMENT_CAPTURE,
            amountCaptured: totalAmount,
            platformRevenue,
            hostLiability,
            status: client_1.LedgerStatus.HELD,
        });
        // 4. Resolve notification templates and enqueue background dispatch
        try {
            const fullBooking = await this.bookingRepo.findFirstByRef(booking.bookingRef);
            if (fullBooking) {
                const client = fullBooking.client;
                const event = fullBooking.event;
                const templates = await this.configRepo.findTemplates({
                    triggerEvent: client_1.TriggerEvent.BOOKING_CONFIRMED,
                    isActive: true,
                });
                for (const temp of templates) {
                    let content = temp.bodyContent;
                    const userName = `${client.firstName} ${client.lastName}`;
                    const replacements = {
                        '{{userName}}': userName,
                        '{{eventTitle}}': event.title,
                        '{{bookingRef}}': booking.bookingRef,
                        '{{seatCount}}': booking.seatCount.toString(),
                        '{{totalAmount}}': booking.totalAmount.toString(),
                    };
                    for (const [placeholder, value] of Object.entries(replacements)) {
                        content = content.replace(new RegExp(placeholder, 'g'), value);
                    }
                    const recipient = temp.channel === client_1.DeliveryChannel.EMAIL ? client.email : client.phone;
                    const log = await this.notificationRepo.create({
                        userId: client.id,
                        channel: temp.channel,
                        triggerEvent: client_1.TriggerEvent.BOOKING_CONFIRMED,
                        recipient,
                        content,
                        status: temp.channel === client_1.DeliveryChannel.IN_APP ? client_1.NotificationStatus.SENT : client_1.NotificationStatus.PENDING,
                        sentAt: temp.channel === client_1.DeliveryChannel.IN_APP ? new Date() : null,
                    });
                    if (temp.channel !== client_1.DeliveryChannel.IN_APP) {
                        await this.queueService.addNotificationJob(log.id);
                    }
                }
            }
        }
        catch {
            // Notification enqueue logging failure silently avoided
        }
        return {
            success: true,
            message: 'Booking payment confirmed directly',
            booking: updatedBooking,
            gatewayTxnId,
            paymentMethod: paymentMethod || 'DIRECT_PAYMENT',
            ledgerEntry,
        };
    }
}
exports.ConfirmBookingPaymentCommandHandler = ConfirmBookingPaymentCommandHandler;
