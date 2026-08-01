"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentController = void 0;
const di_container_1 = require("../di-container");
const api_response_1 = require("../common/api-response");
const errors_1 = require("../common/errors");
const get_razorpay_public_key_1 = require("../../application/use-cases/payments/get-razorpay-public-key");
const checkout_1 = require("../../application/use-cases/bookings/checkout");
const confirm_booking_payment_1 = require("../../application/use-cases/bookings/confirm-booking-payment");
const prisma_1 = require("../../config/prisma");
class PaymentController {
    /**
     * GET /api/v1/payments/razorpay/public-key
     * Public: returns the Razorpay key_id for the client SDK initialisation.
     */
    static async getRazorpayPublicKey(req, res, next) {
        try {
            const result = await di_container_1.mediator.send(new get_razorpay_public_key_1.GetRazorpayPublicKeyQuery());
            return api_response_1.ApiResponse.success(res, result);
        }
        catch (error) {
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
    static async createOrder(req, res, next) {
        try {
            const { eventId, seatCount, customAmount } = req.body;
            if (!eventId || !seatCount) {
                throw new errors_1.BadRequestError('eventId and seatCount are required.');
            }
            const result = await di_container_1.mediator.send(new checkout_1.CheckoutCommand(req.user.id, eventId, Number(seatCount), customAmount ? Number(customAmount) : undefined));
            return api_response_1.ApiResponse.created(res, result, 'Razorpay order created successfully');
        }
        catch (error) {
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
    static async verifyPayment(req, res, next) {
        try {
            const { bookingId, razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;
            if (!bookingId || !razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
                throw new errors_1.BadRequestError('bookingId, razorpayPaymentId, razorpayOrderId, and razorpaySignature are all required.');
            }
            // Verify the Razorpay payment signature via the provider before confirming.
            const isValid = await di_container_1.paymentGatewayProvider.verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
            if (!isValid) {
                throw new errors_1.BadRequestError('Payment signature verification failed. The payment could not be confirmed.');
            }
            // Signature is valid — delegate confirmation to the existing use case.
            // Pass the already-verified signature so the use case skips its own crypto check.
            const result = await di_container_1.mediator.send(new confirm_booking_payment_1.ConfirmBookingPaymentCommand(bookingId, req.user.id, 'RAZORPAY', razorpayPaymentId, razorpayOrderId, razorpaySignature));
            return api_response_1.ApiResponse.success(res, result, 200, 'Payment verified and booking confirmed');
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * GET /api/v1/payments/refund/:bookingId
     * Authenticated: returns the refund request status for a booking.
     * Clients can only view their own; admins can view any.
     */
    static async getRefundStatus(req, res, next) {
        try {
            const { bookingId } = req.params;
            const booking = await prisma_1.prisma.booking.findUnique({
                where: { id: bookingId },
                include: { refundRequest: true },
            });
            if (!booking) {
                throw new errors_1.NotFoundError('Booking not found.');
            }
            // Only the booking owner or a SUPERADMIN may view refund status.
            if (req.user.role !== 'SUPERADMIN' && booking.clientId !== req.user.id) {
                throw new errors_1.ForbiddenError('Access denied. You do not own this booking.');
            }
            if (!booking.refundRequest) {
                return api_response_1.ApiResponse.success(res, {
                    bookingId,
                    bookingRef: booking.bookingRef,
                    bookingStatus: booking.status,
                    refundRequest: null,
                    message: 'No refund request found for this booking.',
                });
            }
            return api_response_1.ApiResponse.success(res, {
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
        }
        catch (error) {
            next(error);
        }
    }
}
exports.PaymentController = PaymentController;
