"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const payment_controller_1 = require("../controllers/payment.controller");
const auth_1 = require("../middleware/auth");
const authorize_1 = require("../middleware/authorize");
const rate_limiter_1 = require("../middleware/rate-limiter");
const system_permissions_1 = require("../../security/system.permissions");
const di_container_1 = require("../di-container");
const authorize_2 = require("../middleware/authorize");
const router = (0, express_1.Router)();
/**
 * Public: Razorpay SDK key for client-side initialisation.
 * No auth needed — key_id is not a secret.
 */
router.get('/razorpay/public-key', payment_controller_1.PaymentController.getRazorpayPublicKey);
// All routes below require authentication
router.use(auth_1.authenticate);
/**
 * POST /api/v1/payments/order
 * Create a Razorpay order for a given event (initiates checkout).
 * Rate-limited to prevent seat spam.
 */
router.post('/order', rate_limiter_1.checkoutLimiter, (0, authorize_1.requirePermission)(system_permissions_1.SystemPermissions.CLIENT_BOOKINGS_CREATE), payment_controller_1.PaymentController.createOrder);
/**
 * POST /api/v1/payments/verify
 * Verify Razorpay payment signature and confirm the booking.
 * Must be called after successful Razorpay checkout modal.
 */
router.post('/verify', (0, authorize_1.requirePermission)(system_permissions_1.SystemPermissions.CLIENT_BOOKINGS_CREATE), payment_controller_1.PaymentController.verifyPayment);
/**
 * GET /api/v1/payments/refund/:bookingId
 * Get refund request status for a booking.
 * CLIENT can only see their own; SUPERADMIN can see any.
 */
router.get('/refund/:bookingId', (0, authorize_2.requireResourceOwner)(async (req) => {
    // For SUPERADMIN the requireResourceOwner middleware short-circuits automatically.
    const booking = await di_container_1.bookingRepo.findById(req.params.bookingId);
    return booking?.clientId;
}), payment_controller_1.PaymentController.getRefundStatus);
exports.default = router;
