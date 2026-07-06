"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HandlePaymentWebhookCommandHandler = exports.HandlePaymentWebhookCommand = void 0;
const client_1 = require("@prisma/client");
class HandlePaymentWebhookCommand {
    payload;
    __tag = 'HandlePaymentWebhookCommand';
    constructor(payload) {
        this.payload = payload;
    }
}
exports.HandlePaymentWebhookCommand = HandlePaymentWebhookCommand;
class HandlePaymentWebhookCommandHandler {
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
        const { payload } = command;
        const { event: eventType, payload: eventPayload } = payload;
        if (eventType !== 'payment.captured') {
            return { status: 'ignored', message: `Unhandled event trigger: ${eventType}` };
        }
        const payment = eventPayload.payment.entity;
        const bookingRef = payment.notes?.bookingRef || payment.description || payment.order_id;
        if (!bookingRef) {
            throw new Error('Could not extract booking reference from transaction metadata.');
        }
        const gatewayTxnId = payment.id || `pay_${Math.random().toString(36).substring(2, 9)}`;
        const booking = await this.bookingRepo.findFirstByRef(bookingRef);
        if (!booking) {
            throw new Error(`Booking record not found for ref: ${bookingRef}`);
        }
        if (booking.status === client_1.BookingStatus.CONFIRMED) {
            return { status: 'processed', bookingId: booking.id, gatewayTxnId };
        }
        // 1. Confirm booking
        await this.bookingRepo.update(booking.id, { status: client_1.BookingStatus.CONFIRMED });
        // 2. Platform revenue vs host liability
        const totalAmount = Number(booking.totalAmount);
        let platformRevenue = 0;
        const commission = booking.event.commission;
        if (commission) {
            if (commission.commissionType === client_1.CommissionType.PERCENTAGE) {
                platformRevenue = totalAmount * (Number(commission.platformValue) / 100);
            }
            else {
                platformRevenue = Number(commission.platformValue);
            }
        }
        else {
            platformRevenue = totalAmount * 0.1;
        }
        const hostLiability = totalAmount - platformRevenue;
        // 3. Write Payment capture to Ledger
        await this.ledgerRepo.create({
            bookingId: booking.id,
            gatewayTxnId,
            type: client_1.LedgerTxnType.PAYMENT_CAPTURE,
            amountCaptured: totalAmount,
            platformRevenue,
            hostLiability,
            status: client_1.LedgerStatus.HELD,
        });
        // 4. Resolve notification templates and enqueue background job dispatch
        const client = booking.client;
        const event = booking.event;
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
        return {
            status: 'processed',
            bookingId: booking.id,
            gatewayTxnId,
        };
    }
}
exports.HandlePaymentWebhookCommandHandler = HandlePaymentWebhookCommandHandler;
