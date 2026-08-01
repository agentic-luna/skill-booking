"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HandlePaymentWebhookCommandHandler = exports.HandlePaymentWebhookCommand = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = require("../../../config/prisma");
const commission_parser_1 = require("../../../utils/commission-parser");
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
    cacheService;
    constructor(bookingRepo, ledgerRepo, configRepo, notificationRepo, queueService, cacheService) {
        this.bookingRepo = bookingRepo;
        this.ledgerRepo = ledgerRepo;
        this.configRepo = configRepo;
        this.notificationRepo = notificationRepo;
        this.queueService = queueService;
        this.cacheService = cacheService;
    }
    async handle(command) {
        const { payload } = command;
        // Extract Razorpay payment details from payload
        const razorpayOrderId = payload.payload?.payment?.entity?.order_id ||
            payload.payload?.order?.entity?.id ||
            payload.razorpay_order_id ||
            payload.razorpayOrderId ||
            payload.order_id;
        const razorpayPaymentId = payload.payload?.payment?.entity?.id ||
            payload.razorpay_payment_id ||
            payload.razorpayPaymentId ||
            payload.paymentId;
        const paymentMethod = payload.payload?.payment?.entity?.method ||
            payload.paymentMethod ||
            'RAZORPAY';
        const capturedAtRaw = payload.payload?.payment?.entity?.created_at;
        const paymentCapturedAt = capturedAtRaw ? new Date(capturedAtRaw * 1000) : new Date();
        const bookingRef = payload.payload?.payment?.entity?.notes?.bookingRef ||
            payload.bookingRef;
        // Find booking primarily using razorpayOrderId
        let booking = null;
        if (razorpayOrderId) {
            booking = await this.bookingRepo.findByRazorpayOrderId(razorpayOrderId);
        }
        // Fall back to searching by bookingRef if not found by orderId
        if (!booking && bookingRef) {
            booking = await this.bookingRepo.findFirstByRef(bookingRef);
        }
        if (!booking) {
            throw new Error(`Booking not found for orderId: ${razorpayOrderId || 'N/A'} / ref: ${bookingRef || 'N/A'}`);
        }
        // Idempotency check: avoid double processing if already confirmed or webhook processed
        if (booking.status === client_1.BookingStatus.CONFIRMED || booking.webhookProcessed) {
            return {
                status: 'already_processed',
                bookingId: booking.id,
                gatewayTxnId: razorpayPaymentId || booking.razorpayPaymentId,
            };
        }
        const gatewayTxnId = razorpayPaymentId || booking.razorpayPaymentId || `pay_wh_${booking.id}`;
        // 1. Mark payment as captured & confirm booking
        const updatedBooking = await this.bookingRepo.markPaymentCaptured(booking.id, {
            razorpayPaymentId: gatewayTxnId,
            paymentMethod,
            paymentCapturedAt,
            paymentGateway: 'RAZORPAY',
        });
        // Increment conversions for boosted events
        try {
            const boost = await prisma_1.prisma.boostedEvent.findFirst({
                where: { eventId: booking.eventId, isActive: true, status: 'ACTIVE' }
            });
            if (boost) {
                await prisma_1.prisma.boostedEvent.update({
                    where: { id: boost.id },
                    data: { conversions: { increment: 1 } }
                });
            }
        }
        catch (err) {
            console.error("[Telemetry] Failed to increment boosted conversion in webhook", err);
        }
        // 2. Platform revenue vs host liability
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
        // 3. Write Payment capture to Ledger idempotently
        const existingLedger = await this.ledgerRepo.findMany({ gatewayTxnId });
        if (!existingLedger || existingLedger.length === 0) {
            await this.ledgerRepo.create({
                bookingId: booking.id,
                gatewayTxnId,
                type: client_1.LedgerTxnType.PAYMENT_CAPTURE,
                amountCaptured: totalAmount,
                platformRevenue,
                hostLiability,
                status: client_1.LedgerStatus.HELD,
            });
        }
        // 4. Resolve notification templates and enqueue background job dispatch
        const client = booking.client;
        const event = booking.event;
        if (client && event) {
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
        // Clear search cache when seats count or booking status changes
        await this.cacheService.delPattern('events:search:*');
        return {
            status: 'processed',
            bookingId: booking.id,
            gatewayTxnId,
        };
    }
}
exports.HandlePaymentWebhookCommandHandler = HandlePaymentWebhookCommandHandler;
