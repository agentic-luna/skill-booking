import { Request, Response, NextFunction } from 'express';
import PDFDocument from 'pdfkit';
import { prisma } from '../../config/prisma';
import { mediator, ticketGenService } from '../di-container';
import { CheckoutCommand } from '../../application/use-cases/bookings/checkout';
import { CancelBookingCommand } from '../../application/use-cases/bookings/cancel-booking';
import { GetCancellationQuoteQuery } from '../../application/use-cases/bookings/get-cancellation-quote';
import { GetMyBookingsQuery } from '../../application/use-cases/bookings/get-my-bookings';
import { ConfirmBookingPaymentCommand } from '../../application/use-cases/bookings/confirm-booking-payment';
import { AuthenticatedRequest } from '../middleware/auth';
import { ApiResponse } from '../common/api-response';
import { BadRequestError, ForbiddenError } from '../common/errors';

export class BookingsController {
  static async checkout(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { eventId, seatCount, customAmount } = req.body;
      const result = await mediator.send(new CheckoutCommand(
        req.user!.id,
        eventId,
        Number(seatCount),
        customAmount ? Number(customAmount) : undefined
      ));
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  static async cancel(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { bookingId } = req.params;
      const { reason } = req.body;
      const cancellation = await mediator.send(new CancelBookingCommand(
        bookingId,
        req.user!.id,
        req.user!.role,
        reason
      ));
      return ApiResponse.success(res, cancellation);
    } catch (error) {
      next(error);
    }
  }

  static async cancellationQuote(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { bookingId } = req.params;
      const result = await mediator.send(new GetCancellationQuoteQuery(
        bookingId,
        req.user!.id,
        req.user!.role
      ));
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  static async getMyBookings(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await mediator.send(new GetMyBookingsQuery(req.user!.id));
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  static async confirmPayment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { bookingId } = req.params;
      const { paymentMethod } = req.body;
      const result = await mediator.send(new ConfirmBookingPaymentCommand(
        bookingId,
        req.user!.id,
        paymentMethod
      ));
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  static async downloadInvoice(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { bookingId } = req.params;
      const booking = await prisma.booking.findUnique({
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
        throw new BadRequestError('Booking not found');
      }

      const isClient = req.user!.id === booking.clientId;
      const isHost = req.user!.id === booking.event.host.userId;
      const isAdmin = req.user!.role === 'SUPERADMIN';
      if (!isClient && !isHost && !isAdmin) {
        throw new ForbiddenError('Access denied: You do not own this booking');
      }

      const pdfBuffer = await ticketGenService.generateInvoicePdf(booking, req.headers.host || 'localhost:4000');
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="invoice_${booking.bookingRef}.pdf"`);
      return res.send(pdfBuffer);
    } catch (error) {
      next(error);
    }
  }

  static async downloadTicket(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { bookingId } = req.params;
      const format = req.query.format as string || 'pdf';

      const booking = await prisma.booking.findUnique({
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
        throw new BadRequestError('Booking not found');
      }

      const isClient = req.user!.id === booking.clientId;
      const isHost = req.user!.id === booking.event.host.userId;
      const isAdmin = req.user!.role === 'SUPERADMIN';
      if (!isClient && !isHost && !isAdmin) {
        throw new ForbiddenError('Access denied: You do not own this booking');
      }

      if (format === 'png' || format === 'svg') {
        const svgContent = await ticketGenService.generateTicketSvg(booking, req.headers.host || 'localhost:4000');
        res.setHeader('Content-Type', 'image/svg+xml');
        res.setHeader('Content-Disposition', `attachment; filename="ticket_${booking.bookingRef}.svg"`);
        return res.send(svgContent);
      } else {
        const pdfBuffer = await ticketGenService.generateTicketPdf(booking, req.headers.host || 'localhost:4000');
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="ticket_${booking.bookingRef}.pdf"`);
        return res.send(pdfBuffer);
      }
    } catch (error) {
      next(error);
    }
  }

  static async verifyBooking(req: Request, res: Response, next: NextFunction) {
    try {
      const { bookingId } = req.params;

      const booking = await prisma.booking.findUnique({
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

      res.setHeader('Content-Type', 'text/html');

      if (!booking) {
        return res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invalid Ticket - BookMySkill</title>
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
    <p>We could not find any active booking record matching this Ticket ID in the BookMySkill database.</p>
    <p>Please double-check the booking details or contact the help desk at support@bookmyskill.com.</p>
    <div class="footer">BookMySkill Verification Engine</div>
  </div>
</body>
</html>
        `);
      }

      const client = booking.client || {};
      const event = booking.event || {};
      const host = event.host?.user || {};
      const venueName = event.mode === 'ONLINE' ? 'Online Live Stream' : ((event.venueDetails as any)?.address || 'Physical Venue');
      const formattedDate = new Date(event.startTime).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
      const formattedTime = new Date(event.startTime).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

      const statusColor = booking.status === 'CONFIRMED' ? '#10b981' : '#b91c1c';
      const statusText = booking.status;

      return res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ticket Verification - BookMySkill</title>
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
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <p>🎫 BOOKMYSKILL VERIFICATION</p>
      <h1>Ticket Verified</h1>
      <span class="status-badge" style="background-color: ${statusColor};">${statusText}</span>
    </div>
    <div class="content">
      <h3 class="section-title">Ticket Holder</h3>
      <div class="attendee-name">${(client.firstName + ' ' + client.lastName).toUpperCase()}</div>
      
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
      BookMySkill Verification Engine © ${new Date().getFullYear()}
    </div>
  </div>
</body>
</html>
      `);
    } catch (error) {
      next(error);
    }
  }
}
