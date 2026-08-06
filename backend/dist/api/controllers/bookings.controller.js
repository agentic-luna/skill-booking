"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingsController = void 0;
const di_container_1 = require("../di-container");
const checkout_1 = require("../../application/use-cases/bookings/checkout");
const cancel_booking_1 = require("../../application/use-cases/bookings/cancel-booking");
const get_cancellation_quote_1 = require("../../application/use-cases/bookings/get-cancellation-quote");
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
            const { reason } = req.body;
            const cancellation = await di_container_1.mediator.send(new cancel_booking_1.CancelBookingCommand(bookingId, req.user.id, req.user.role, reason));
            return api_response_1.ApiResponse.success(res, cancellation);
        }
        catch (error) {
            next(error);
        }
    }
    static async cancellationQuote(req, res, next) {
        try {
            const { bookingId } = req.params;
            const result = await di_container_1.mediator.send(new get_cancellation_quote_1.GetCancellationQuoteQuery(bookingId, req.user.id, req.user.role));
            return api_response_1.ApiResponse.success(res, result);
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
            const { paymentMethod, razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;
            const result = await di_container_1.mediator.send(new confirm_booking_payment_1.ConfirmBookingPaymentCommand(bookingId, req.user.id, paymentMethod, razorpayPaymentId, razorpayOrderId, razorpaySignature));
            return api_response_1.ApiResponse.success(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    static async downloadInvoice(req, res, next) {
        try {
            const { bookingId } = req.params;
            const booking = await di_container_1.bookingRepo.findById(bookingId);
            if (!booking) {
                throw new errors_1.BadRequestError('Booking not found');
            }
            const isClient = req.user.id === booking.clientId;
            const isHost = req.user.id === booking.event.host.userId;
            const isAdmin = req.user.role === 'SUPERADMIN';
            if (!isClient && !isHost && !isAdmin) {
                throw new errors_1.ForbiddenError('Access denied: You do not own this booking');
            }
            const pdfBuffer = await di_container_1.ticketGenService.generateInvoicePdf(booking, req.headers.host || 'localhost:4000');
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="invoice_${booking.bookingRef}.pdf"`);
            return res.send(pdfBuffer);
        }
        catch (error) {
            next(error);
        }
    }
    static async downloadTicket(req, res, next) {
        try {
            const { bookingId } = req.params;
            const format = req.query.format || 'pdf';
            const booking = await di_container_1.bookingRepo.findById(bookingId);
            if (!booking) {
                throw new errors_1.BadRequestError('Booking not found');
            }
            const isClient = req.user.id === booking.clientId;
            const isHost = req.user.id === booking.event.host.userId;
            const isAdmin = req.user.role === 'SUPERADMIN';
            if (!isClient && !isHost && !isAdmin) {
                throw new errors_1.ForbiddenError('Access denied: You do not own this booking');
            }
            if (format === 'png' || format === 'svg') {
                const svgContent = await di_container_1.ticketGenService.generateTicketSvg(booking, req.headers.host || 'localhost:4000');
                res.setHeader('Content-Type', 'image/svg+xml');
                res.setHeader('Content-Disposition', `attachment; filename="ticket_${booking.bookingRef}.svg"`);
                return res.send(svgContent);
            }
            else {
                const pdfBuffer = await di_container_1.ticketGenService.generateTicketPdf(booking, req.headers.host || 'localhost:4000');
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', `attachment; filename="ticket_${booking.bookingRef}.pdf"`);
                return res.send(pdfBuffer);
            }
        }
        catch (error) {
            next(error);
        }
    }
    static async verifyBooking(req, res, next) {
        try {
            const { bookingId } = req.params;
            const booking = await di_container_1.bookingRepo.findById(bookingId);
            res.setHeader('Content-Type', 'text/html');
            if (!booking) {
                return res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invalid Ticket - BookMyTraining</title>
  <style>
    body { font-family: -apple-system, sans-serif; background-color: #f3f4f6; color: #1f2937; text-align: center; padding: 40px 20px; }
    .card { background: white; max-width: 450px; margin: 0 auto; padding: 30px; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); border-top: 5px solid #ef4444; }
    h1 { color: #dc2626; font-size: 24px; margin-top: 0; }
    p { color: #4b5563; font-size: 15px; line-height: 1.5; }
    .footer { margin-top: 30px; font-size: 12px; color: #9ca3af; }
  </style>
</head>
<body>
  <div class="card">
    <h1>❌ Invalid Ticket</h1>
    <p>We could not find any active booking record matching this Ticket ID in the BookMyTraining database.</p>
    <p>Please double-check the booking details or contact the help desk at support@bookmytraining.co.in.</p>
    <div class="footer">BookMyTraining Verification Engine</div>
  </div>
</body>
</html>
        `);
            }
            const client = booking.client || {};
            const event = booking.event || {};
            const host = event.host?.user || {};
            const venueName = event.mode === 'ONLINE' ? 'Online Live Stream' : (event.venueDetails?.address || 'Physical Venue');
            const formattedDate = new Date(event.startTime).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
            const formattedTime = new Date(event.startTime).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
            const participantsList = Array.isArray(booking.participants) && booking.participants.length > 0
                ? booking.participants
                : [{ fullName: `${client.firstName || ''} ${client.lastName || ''}`.trim(), email: client.email, mobile: client.phone, isPrimary: true }];
            const primaryAttendee = participantsList.find((p) => p.isPrimary) || participantsList[0];
            const primaryName = (primaryAttendee?.fullName || `${client.firstName || ''} ${client.lastName || ''}`).trim().toUpperCase();
            const statusColor = booking.status === 'CONFIRMED' ? '#10b981' : '#b91c1c';
            const statusText = booking.status;
            return res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ticket Verification - BookMyTraining</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #f0fdf4; color: #1f2937; margin: 0; padding: 20px; }
    .card { background: white; max-width: 500px; margin: 30px auto; border-radius: 20px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05), 0 4px 6px -4px rgba(0,0,0,0.05); overflow: hidden; border: 1px solid #e5e7eb; }
    .header { background: linear-gradient(135deg, #064e3b, #10b981); color: white; padding: 30px 24px; text-align: center; }
    .header h1 { margin: 0; font-size: 26px; font-weight: 800; letter-spacing: 0.5px; }
    .header p { margin: 6px 0 0 0; font-size: 13px; color: #a7f3d0; font-weight: 600; letter-spacing: 1px; }
    .status-badge { display: inline-block; padding: 6px 14px; border-radius: 50px; color: white; font-weight: 800; font-size: 12px; margin-top: 15px; text-transform: uppercase; letter-spacing: 1px; }
    .content { padding: 30px 24px; }
    .section-title { font-size: 11px; font-weight: 800; color: #047857; letter-spacing: 1px; margin-top: 0; margin-bottom: 8px; text-transform: uppercase; }
    .attendee-name { font-size: 22px; font-weight: 800; color: #111827; margin: 0 0 15px 0; }
    .divider { height: 1px; background-color: #f3f4f6; margin: 20px 0; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .info-item { display: flex; flex-direction: column; }
    .info-label { font-size: 10px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
    .info-value { font-size: 14px; font-weight: 700; color: #374151; }
    .venue-value { font-size: 13px; font-weight: 700; color: #374151; line-height: 1.4; }
    .footer { text-align: center; padding: 20px; font-size: 11px; color: #9ca3af; border-top: 1px solid #f3f4f6; background-color: #fafafa; font-weight: 600; }
    .participant-card { background: #f9fafb; padding: 10px 12px; border-radius: 10px; margin-bottom: 8px; border: 1px solid #f3f4f6; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <p>🎫 BOOKMYTRAINING VERIFICATION</p>
      <h1>Ticket Verified</h1>
      <span class="status-badge" style="background-color: ${statusColor};">${statusText}</span>
    </div>
    <div class="content">
      <h3 class="section-title">Primary Ticket Holder</h3>
      <div class="attendee-name">${primaryName}</div>

      ${participantsList.length > 0 ? `
        <h3 class="section-title">All Enrolled Participants (${participantsList.length})</h3>
        <div style="margin-bottom: 20px;">
          ${participantsList.map((p, idx) => `
            <div class="participant-card">
              <div style="font-weight: 800; font-size: 13px; color: #111827;">
                ${idx + 1}. ${p.fullName} ${p.isPrimary ? '<span style="font-size: 9px; background: #d1fae5; color: #047857; padding: 2px 6px; border-radius: 4px; font-weight: 800; margin-left: 6px;">PRIMARY</span>' : ''}
              </div>
              <div style="font-size: 11px; color: #6b7280; margin-top: 3px;">
                ${p.email ? '📧 ' + p.email : ''} ${p.mobile ? ' • 📱 ' + p.mobile : ''} ${p.state ? ' • 📍 ' + p.state : ''}
              </div>
            </div>
          `).join('')}
        </div>
      ` : ''}
      
      <h3 class="section-title">Workshop Details</h3>
      <div style="font-size: 17px; font-weight: 800; color: #1f2937; margin-bottom: 15px;">${event.title}</div>
      
      <div class="info-grid">
        <div class="info-item">
          <span class="info-label">Date</span>
          <span class="info-value">${formattedDate}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Time</span>
          <span class="info-value">${formattedTime}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Instructor</span>
          <span class="info-value">${host.firstName || 'Platform'} ${host.lastName || 'Host'}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Seat Count</span>
          <span class="info-value">${booking.seatCount} Seat(s)</span>
        </div>
        <div class="info-item" style="grid-column: span 2;">
          <span class="info-label">Venue / Meeting URL</span>
          <span class="venue-value">${venueName}</span>
        </div>
      </div>
      
      <div class="divider"></div>
      
      <div class="info-grid" style="grid-template-columns: 1fr;">
        <div class="info-item">
          <span class="info-label">Booking Reference</span>
          <span class="info-value" style="font-family: monospace; font-size: 15px; color: #047857;">${booking.bookingRef}</span>
        </div>
      </div>
    </div>
    <div class="footer">
      BookMyTraining Verification Engine © ${new Date().getFullYear()}
    </div>
  </div>
</body>
</html>
      `);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.BookingsController = BookingsController;
