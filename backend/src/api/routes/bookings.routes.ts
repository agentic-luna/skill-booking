import { Router } from 'express';
import { BookingsController } from '../controllers/bookings.controller';
import { authenticate } from '../middleware/auth';
import { requirePermission, requireResourceOwner } from '../middleware/authorize';
import { checkoutLimiter } from '../middleware/rate-limiter';
import { SystemPermissions } from '../../security/system.permissions';
import { bookingRepo } from '../di-container';

const router = Router();

router.get('/:bookingId/verify', BookingsController.verifyBooking as any);

router.use(authenticate as any);

router.get('/my-bookings', requirePermission(SystemPermissions.CLIENT_BOOKINGS_READ_OWN) as any, BookingsController.getMyBookings as any);
router.get('/mybookings', requirePermission(SystemPermissions.CLIENT_BOOKINGS_READ_OWN) as any, BookingsController.getMyBookings as any);
router.get('/:bookingId/invoice', BookingsController.downloadInvoice as any);
router.get('/:bookingId/ticket', BookingsController.downloadTicket as any);

router.post('/checkout', checkoutLimiter, requirePermission(SystemPermissions.CLIENT_BOOKINGS_CREATE) as any, BookingsController.checkout as any);

router.post(
  '/:bookingId/confirm',
  requirePermission(SystemPermissions.CLIENT_BOOKINGS_CREATE) as any,
  requireResourceOwner(async (req) => {
    const booking = await bookingRepo.findById(req.params.bookingId);
    return booking?.clientId;
  }) as any,
  BookingsController.confirmPayment as any
);

router.post(
  '/:bookingId/confirm-payment',
  requirePermission(SystemPermissions.CLIENT_BOOKINGS_CREATE) as any,
  requireResourceOwner(async (req) => {
    const booking = await bookingRepo.findById(req.params.bookingId);
    return booking?.clientId;
  }) as any,
  BookingsController.confirmPayment as any
);

router.get(
  '/:bookingId/cancellation-quote',
  requirePermission(SystemPermissions.CLIENT_BOOKINGS_CANCEL_OWN) as any,
  requireResourceOwner(async (req) => {
    const booking = await bookingRepo.findById(req.params.bookingId);
    return booking?.clientId;
  }) as any,
  BookingsController.cancellationQuote as any
);

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
