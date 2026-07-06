import { Router } from 'express';
import { BookingsController } from '../controllers/bookings.controller';
import { authenticate } from '../middleware/auth';
import { checkoutLimiter } from '../middleware/rate-limiter';

const router = Router();

router.use(authenticate as any);

router.post('/checkout', checkoutLimiter, BookingsController.checkout as any);
router.post('/:bookingId/cancel', BookingsController.cancel as any);

export default router;
