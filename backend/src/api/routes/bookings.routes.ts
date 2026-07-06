import { Router } from 'express';
import { BookingsController } from '../controllers/bookings.controller';
import { authenticate } from '../middleware/auth';
import { requirePermission, requireResourceOwner } from '../middleware/authorize';
import { checkoutLimiter } from '../middleware/rate-limiter';
import { SystemPermissions } from '../../security/system.permissions';
import { bookingRepo } from '../di-container';

const router = Router();

router.use(authenticate as any);

router.post('/checkout', checkoutLimiter, requirePermission(SystemPermissions.CLIENT_BOOKINGS_CREATE) as any, BookingsController.checkout as any);
router.post(
  '/:bookingId/cancel',
  requirePermission(SystemPermissions.CLIENT_BOOKINGS_CANCEL_OWN) as any,
  requireResourceOwner(async (req) => {
    const booking = await bookingRepo.findById(req.params.bookingId);
    return booking?.clientId;
  }) as any,
  BookingsController.cancel as any
);

export default router;
