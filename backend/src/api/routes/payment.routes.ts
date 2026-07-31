import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { authenticate } from '../middleware/auth';
import { requirePermission } from '../middleware/authorize';
import { checkoutLimiter } from '../middleware/rate-limiter';
import { SystemPermissions } from '../../security/system.permissions';
import { bookingRepo } from '../di-container';
import { requireResourceOwner } from '../middleware/authorize';

const router = Router();

/**
 * Public: Razorpay SDK key for client-side initialisation.
 * No auth needed — key_id is not a secret.
 */
router.get('/razorpay/public-key', PaymentController.getRazorpayPublicKey as any);

// All routes below require authentication
router.use(authenticate as any);

/**
 * POST /api/v1/payments/order
 * Create a Razorpay order for a given event (initiates checkout).
 * Rate-limited to prevent seat spam.
 */
router.post(
  '/order',
  checkoutLimiter,
  requirePermission(SystemPermissions.CLIENT_BOOKINGS_CREATE) as any,
  PaymentController.createOrder as any
);

/**
 * POST /api/v1/payments/verify
 * Verify Razorpay payment signature and confirm the booking.
 * Must be called after successful Razorpay checkout modal.
 */
router.post(
  '/verify',
  requirePermission(SystemPermissions.CLIENT_BOOKINGS_CREATE) as any,
  PaymentController.verifyPayment as any
);

/**
 * GET /api/v1/payments/refund/:bookingId
 * Get refund request status for a booking.
 * CLIENT can only see their own; SUPERADMIN can see any.
 */
router.get(
  '/refund/:bookingId',
  requireResourceOwner(async (req) => {
    // For SUPERADMIN the requireResourceOwner middleware short-circuits automatically.
    const booking = await bookingRepo.findById(req.params.bookingId);
    return booking?.clientId;
  }) as any,
  PaymentController.getRefundStatus as any
);

export default router;