import { Response, NextFunction } from 'express';
import PDFDocument from 'pdfkit';
import { prisma } from '../../config/prisma';
import { mediator } from '../di-container';
import { CheckoutCommand } from '../../application/use-cases/bookings/checkout';
import { CancelBookingCommand } from '../../application/use-cases/bookings/cancel-booking';
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
      const cancellation = await mediator.send(new CancelBookingCommand(
        bookingId,
        req.user!.id,
        req.user!.role
      ));
      return ApiResponse.success(res, cancellation);
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

      const doc = new PDFDocument({ margin: 50 });
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
    } catch (error) {
      next(error);
    }
  }
}
