"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingsController = void 0;
const pdfkit_1 = __importDefault(require("pdfkit"));
const prisma_1 = require("../../config/prisma");
const di_container_1 = require("../di-container");
const checkout_1 = require("../../application/use-cases/bookings/checkout");
const cancel_booking_1 = require("../../application/use-cases/bookings/cancel-booking");
const get_my_bookings_1 = require("../../application/use-cases/bookings/get-my-bookings");
const confirm_booking_payment_1 = require("../../application/use-cases/bookings/confirm-booking-payment");
const api_response_1 = require("../common/api-response");
const errors_1 = require("../common/errors");
class BookingsController {
    static async checkout(req, res, next) {
        try {
            const { eventId, seatCount, customAmount } = req.body;
            const result = await di_container_1.mediator.send(new checkout_1.CheckoutCommand(req.user.id, eventId, Number(seatCount), customAmount ? Number(customAmount) : undefined));
            return api_response_1.ApiResponse.success(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    static async cancel(req, res, next) {
        try {
            const { bookingId } = req.params;
            const cancellation = await di_container_1.mediator.send(new cancel_booking_1.CancelBookingCommand(bookingId, req.user.id, req.user.role));
            return api_response_1.ApiResponse.success(res, cancellation);
        }
        catch (error) {
            next(error);
        }
    }
    static async getMyBookings(req, res, next) {
        try {
            const result = await di_container_1.mediator.send(new get_my_bookings_1.GetMyBookingsQuery(req.user.id));
            return api_response_1.ApiResponse.success(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    static async confirmPayment(req, res, next) {
        try {
            const { bookingId } = req.params;
            const { paymentMethod } = req.body;
            const result = await di_container_1.mediator.send(new confirm_booking_payment_1.ConfirmBookingPaymentCommand(bookingId, req.user.id, paymentMethod));
            return api_response_1.ApiResponse.success(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    static async downloadInvoice(req, res, next) {
        try {
            const { bookingId } = req.params;
            const booking = await prisma_1.prisma.booking.findUnique({
                where: { id: bookingId },
                include: {
                    client: true,
                    event: {
                        include: {
                            host: {
                                include: {
                                    user: true,
                                },
                            },
                        },
                    },
                },
            });
            if (!booking) {
                throw new errors_1.BadRequestError('Booking not found');
            }
            const isClient = req.user.id === booking.clientId;
            const isHost = req.user.id === booking.event.host.userId;
            const isAdmin = req.user.role === 'SUPERADMIN';
            if (!isClient && !isHost && !isAdmin) {
                throw new errors_1.ForbiddenError('Access denied: You do not own this booking');
            }
            const doc = new pdfkit_1.default({ margin: 50 });
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="invoice_${booking.bookingRef}.pdf"`);
            doc.pipe(res);
            doc.font('Helvetica-Bold').fontSize(20).text('LUNA SKILL-BOOKING PLATFORM', { align: 'center' });
            doc.font('Helvetica').fontSize(10).text('Enterprise Skill-Training & Live Workshops', { align: 'center' });
            doc.moveDown(2);
            doc.font('Helvetica-Bold').fontSize(16).text('INVOICE', { underline: true });
            doc.font('Helvetica').moveDown(1);
            doc.fontSize(10);
            doc.text(`Booking Reference: ${booking.bookingRef}`);
            doc.text(`Invoice Date: ${new Date(booking.createdAt).toLocaleDateString()}`);
            doc.text(`Payment Status: ${booking.status}`);
            doc.moveDown(1.5);
            doc.font('Helvetica-Bold').fontSize(12).text('Billing Details:');
            doc.font('Helvetica').fontSize(10);
            doc.text(`Client Name: ${booking.client.firstName} ${booking.client.lastName}`);
            doc.text(`Client Email: ${booking.client.email}`);
            doc.text(`Client Phone: ${booking.client.phone}`);
            doc.moveDown(1.5);
            const hostUser = booking.event.host.user;
            doc.font('Helvetica-Bold').fontSize(12).text('Workshop Details:');
            doc.font('Helvetica').fontSize(10);
            doc.text(`Event Title: ${booking.event.title}`);
            doc.text(`Start Time: ${new Date(booking.event.startTime).toLocaleString()}`);
            doc.text(`Instructor: ${hostUser.firstName} ${hostUser.lastName}`);
            doc.moveDown(1.5);
            doc.font('Helvetica-Bold').fontSize(12).text('Pricing Breakdown:');
            doc.font('Helvetica').moveDown(0.5);
            doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
            doc.moveDown(0.5);
            const tableTop = doc.y;
            doc.text('Item Description', 50, tableTop);
            doc.text('Seats', 350, tableTop, { width: 50, align: 'right' });
            doc.text('Total Amount', 450, tableTop, { width: 100, align: 'right' });
            doc.moveDown(0.5);
            doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
            doc.moveDown(0.5);
            const itemY = doc.y;
            doc.text(`Ticket Admission - ${booking.event.title}`, 50, itemY, { width: 280 });
            doc.text(String(booking.seatCount), 350, itemY, { width: 50, align: 'right' });
            doc.text(`${booking.totalAmount} INR`, 450, itemY, { width: 100, align: 'right' });
            doc.moveDown(1.5);
            doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
            doc.moveDown(1);
            doc.font('Helvetica-Bold').fontSize(14).text(`Total Paid: ${booking.totalAmount} INR`, { align: 'right' });
            doc.font('Helvetica').moveDown(3);
            doc.fontSize(8).text('Thank you for booking with Luna! If you have any refund requests or queries, please contact help@luna.com.', { align: 'center' });
            doc.end();
        }
        catch (error) {
            next(error);
        }
    }
}
exports.BookingsController = BookingsController;
