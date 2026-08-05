import { Response, NextFunction } from 'express';
import { mediator, paymentGatewayProvider } from '../di-container';
import { ApiResponse } from '../common/api-response';
import { BadRequestError, NotFoundError, ForbiddenError } from '../common/errors';
import { AuthenticatedRequest } from '../middleware/auth';
import { GetRazorpayPublicKeyQuery } from '../../application/use-cases/payments/get-razorpay-public-key';
import { CheckoutCommand } from '../../application/use-cases/bookings/checkout';
import { ConfirmBookingPaymentCommand } from '../../application/use-cases/bookings/confirm-booking-payment';
import { prisma } from '../../config/prisma';

export class PaymentController {
  /**
   * GET /api/v1/payments/razorpay/public-key
   * Public: returns the Razorpay key_id for the client SDK initialisation.
   */
  static async getRazorpayPublicKey(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const result = await mediator.send(new GetRazorpayPublicKeyQuery());
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  

  /**
   * POST /api/v1/payments/order
   * Authenticated (CLIENT): create a Razorpay order for an event checkout.
   *
   * Body: { eventId, seatCount, customAmount? }
   * Returns: { booking, razorpayOrder, eventTitle }
   */
  static async createOrder(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { eventId, seatCount, customAmount, participants } = req.body;

      if (!eventId || !seatCount) {
        throw new BadRequestError('eventId and seatCount are required.');
      }

      const result = await mediator.send(
        new CheckoutCommand(
          req.user!.id,
          eventId,
          Number(seatCount),
          customAmount ? Number(customAmount) : undefined,
          Array.isArray(participants) ? participants : undefined
        )
      );

      return ApiResponse.created(res, result, 'Razorpay order created successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/payments/verify
   * Authenticated (CLIENT): verify Razorpay payment signature and confirm the booking.
   *
   * Body: { bookingId, razorpayPaymentId, razorpayOrderId, razorpaySignature }
   * Returns: confirmed booking + ledger entry
   */
  static async verifyPayment(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { bookingId, razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;

      if (!bookingId || !razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
        throw new BadRequestError(
          'bookingId, razorpayPaymentId, razorpayOrderId, and razorpaySignature are all required.'
        );
      }

      // Verify the Razorpay payment signature via the provider before confirming.
      const isValid = await paymentGatewayProvider.verifyPaymentSignature(
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature
      );

      if (!isValid) {
        throw new BadRequestError('Payment signature verification failed. The payment could not be confirmed.');
      }

      // Signature is valid — delegate confirmation to the existing use case.
      // Pass the already-verified signature so the use case skips its own crypto check.
      const result = await mediator.send(
        new ConfirmBookingPaymentCommand(
          bookingId,
          req.user!.id,
          'RAZORPAY',
          razorpayPaymentId,
          razorpayOrderId,
          razorpaySignature
        )
      );

      return ApiResponse.success(res, result, 200, 'Payment verified and booking confirmed');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/payments/refund/:bookingId
   * Authenticated: returns the refund request status for a booking.
   * Clients can only view their own; admins can view any.
   */
  static async getRefundStatus(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { bookingId } = req.params;

      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { refundRequest: true },
      });

      if (!booking) {
        throw new NotFoundError('Booking not found.');
      }

      // Only the booking owner or a SUPERADMIN may view refund status.
      if (req.user!.role !== 'SUPERADMIN' && booking.clientId !== req.user!.id) {
        throw new ForbiddenError('Access denied. You do not own this booking.');
      }

      if (!booking.refundRequest) {
        return ApiResponse.success(res, {
          bookingId,
          bookingRef: booking.bookingRef,
          bookingStatus: booking.status,
          refundRequest: null,
          message: 'No refund request found for this booking.',
        });
      }

      return ApiResponse.success(res, {
        bookingId,
        bookingRef: booking.bookingRef,
        bookingStatus: booking.status,
        refundRequest: {
          id: booking.refundRequest.id,
          status: booking.refundRequest.status,
          refundAmount: booking.refundRequest.refundAmount,
          refundPercentage: booking.refundRequest.refundPercentage,
          reason: booking.refundRequest.reason,
          createdAt: booking.refundRequest.createdAt,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}