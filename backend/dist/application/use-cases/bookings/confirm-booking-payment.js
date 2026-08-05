"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfirmBookingPaymentCommandHandler = exports.ConfirmBookingPaymentCommand = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = require("../../../config/prisma");
const errors_1 = require("../../common/errors");
const commission_parser_1 = require("../../../utils/commission-parser");
const crypto_1 = __importDefault(require("crypto"));
const ticket_generation_service_1 = require("../../../infrastructure/services/ticket-generation.service");
const templates_1 = require("../../../constants/templates");
class ConfirmBookingPaymentCommand {
    bookingId;
    clientId;
    paymentMethod;
    razorpayPaymentId;
    razorpayOrderId;
    razorpaySignature;
    __tag = 'ConfirmBookingPaymentCommand';
    constructor(bookingId, clientId, paymentMethod, razorpayPaymentId, razorpayOrderId, razorpaySignature) {
        this.bookingId = bookingId;
        this.clientId = clientId;
        this.paymentMethod = paymentMethod;
        this.razorpayPaymentId = razorpayPaymentId;
        this.razorpayOrderId = razorpayOrderId;
        this.razorpaySignature = razorpaySignature;
    }
}
exports.ConfirmBookingPaymentCommand = ConfirmBookingPaymentCommand;
class ConfirmBookingPaymentCommandHandler {
    bookingRepo;
    ledgerRepo;
    configRepo;
    cryptoService;
    notificationRepo;
    queueService;
    cacheService;
    constructor(bookingRepo, ledgerRepo, configRepo, cryptoService, notificationRepo, queueService, cacheService) {
        this.bookingRepo = bookingRepo;
        this.ledgerRepo = ledgerRepo;
        this.configRepo = configRepo;
        this.cryptoService = cryptoService;
        this.notificationRepo = notificationRepo;
        this.queueService = queueService;
        this.cacheService = cacheService;
    }
    async handle(command) {
        const { bookingId, clientId, paymentMethod, razorpayOrderId, razorpayPaymentId } = command;
        let booking = await this.bookingRepo.findById(bookingId);
        if (!booking && razorpayOrderId) {
            booking = await this.bookingRepo.findByRazorpayOrderId(razorpayOrderId);
        }
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
        let gatewayTxnId = `direct_pay_${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
        if (command.razorpaySignature) {
            const config = await this.configRepo.findIntegration(client_1.IntegrationService.RAZORPAY);
            if (!config || !config.credentials || typeof config.credentials !== 'object') {
                throw new errors_1.BadRequestError('Payment gateway is not configured. Admin has to configure Razorpay credentials.');
            }
            const decrypted = this.cryptoService.decryptCredentials(config.credentials);
            const keySecret = decrypted?.keySecret;
            if (!keySecret) {
                throw new errors_1.BadRequestError('Payment gateway is not configured. Admin has to configure Razorpay credentials.');
            }
            // Verify signature
            const hmac = crypto_1.default.createHmac('sha256', keySecret);
            hmac.update(`${command.razorpayOrderId}|${command.razorpayPaymentId}`);
            const generatedSignature = hmac.digest('hex');
            if (generatedSignature !== command.razorpaySignature) {
                throw new errors_1.BadRequestError('Invalid payment signature');
            }
            gatewayTxnId = command.razorpayPaymentId || gatewayTxnId;
        }
        // 1. Mark payment captured & confirm booking
        const updatedBooking = await this.bookingRepo.markPaymentCaptured(booking.id, {
            razorpayPaymentId: razorpayPaymentId || gatewayTxnId,
            paymentMethod: paymentMethod || 'RAZORPAY',
            paymentCapturedAt: new Date(),
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
            console.error("[Telemetry] Failed to increment boosted conversion", err);
        }
        // 2. Compute platform revenue vs host liability
        const totalAmount = Number(booking.totalAmount);
        let platformRevenue = 0;
        // Use snapshotted commission on booking if available, otherwise fall back to event commission
        const commType = booking.commissionType != null ? booking.commissionType : booking.event?.commission?.commissionType;
        const commValue = booking.platformValue != null ? booking.platformValue : booking.event?.commission?.platformValue;
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
        // 3. Write Payment capture entry to Transaction Ledger idempotently
        let ledgerEntry = null;
        const existingLedger = await this.ledgerRepo.findMany({ gatewayTxnId });
        if (!existingLedger || existingLedger.length === 0) {
            ledgerEntry = await this.ledgerRepo.create({
                bookingId: booking.id,
                gatewayTxnId,
                type: client_1.LedgerTxnType.PAYMENT_CAPTURE,
                amountCaptured: totalAmount,
                platformRevenue,
                hostLiability,
                status: client_1.LedgerStatus.HELD,
            });
        }
        else {
            ledgerEntry = existingLedger[0];
        }
        // 4. Resolve notification templates and enqueue background dispatch
        try {
            const fullBooking = await this.bookingRepo.findFirstByRef(booking.bookingRef);
            if (fullBooking) {
                const client = fullBooking.client;
                const event = fullBooking.event;
                const userName = `${client.firstName} ${client.lastName}`;
                const hostUser = event?.host?.user;
                const trainerName = event?.trainerName || (hostUser ? `${hostUser.firstName} ${hostUser.lastName}` : 'Platform Host');
                const venueInfo = event.mode === 'ONLINE' ? 'Online Live Stream' : (event.venueDetails?.address || 'Physical Venue');
                const formattedDate = new Date(event.startTime).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
                const formattedTime = new Date(event.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                const verifyUrl = `/api/v1/bookings/${booking.id}/verify`;
                const ticketDownloadUrl = `/api/v1/bookings/${booking.id}/download-ticket?format=svg`;
                // Generate Ticket Image SVG
                let ticketSvgDataUrl = undefined;
                try {
                    const ticketGenService = new ticket_generation_service_1.TicketGenerationService();
                    const svgContent = await ticketGenService.generateTicketSvg(fullBooking, 'localhost:4000');
                    const base64Svg = Buffer.from(svgContent).toString('base64');
                    ticketSvgDataUrl = `data:image/svg+xml;base64,${base64Svg}`;
                }
                catch (err) {
                    // If SVG generation encounters an issue, fallback silently
                }
                const templateData = {
                    userName,
                    bookingRef: booking.bookingRef,
                    bookingId: booking.id,
                    eventTitle: event.title,
                    formattedDate,
                    formattedTime,
                    seatCount: booking.seatCount,
                    totalAmount: Number(booking.totalAmount),
                    trainerName,
                    venueInfo,
                    verifyUrl,
                    ticketDownloadUrl,
                    ticketSvgDataUrl,
                };
                const emailContent = (0, templates_1.generateTicketEmailTemplate)(templateData);
                const whatsappContent = (0, templates_1.generateTicketWhatsAppTemplate)(templateData);
                const inAppContent = (0, templates_1.generateTicketInAppTemplate)(templateData);
                const notificationTargets = [];
                // In-app notification
                notificationTargets.push({
                    channel: client_1.DeliveryChannel.IN_APP,
                    recipient: client.email || client.id,
                    content: inAppContent,
                });
                // Email ticket
                if (client.email) {
                    notificationTargets.push({
                        channel: client_1.DeliveryChannel.EMAIL,
                        recipient: client.email,
                        content: emailContent,
                    });
                }
                // WhatsApp ticket
                if (client.phone) {
                    notificationTargets.push({
                        channel: client_1.DeliveryChannel.WHATSAPP,
                        recipient: client.phone,
                        content: whatsappContent,
                    });
                }
                for (const target of notificationTargets) {
                    const log = await this.notificationRepo.create({
                        userId: client.id,
                        channel: target.channel,
                        triggerEvent: client_1.TriggerEvent.TICKET_DELIVERY,
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
        catch {
            // Notification enqueue logging failure silently avoided
        }
        // Clear the search cache when a booking changes seats or status
        await this.cacheService.delPattern('events:search:*');
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
