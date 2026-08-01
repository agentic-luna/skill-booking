import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { BoostedEventsController } from '../controllers/boosted-events.controller';
import { authenticate } from '../middleware/auth';
import { requireRole, requirePermission } from '../middleware/authorize';
import { SystemPermissions } from '../../security/system.permissions';

const router = Router();

router.get('/', BoostedEventsController.getActiveBoostedEvents);
router.get('/pricing', BoostedEventsController.getPricing);
router.get('/plans', BoostedEventsController.getPricing);
router.post('/click', BoostedEventsController.trackClick as any);
router.get('/analytics/:eventId', authenticate as any, BoostedEventsController.getAnalytics as any);

router.post(
  '/',
  authenticate as any,
  requireRole(UserRole.SUPERADMIN) as any,
  requirePermission(SystemPermissions.ADMIN_EVENTS_BOOST) as any,
  BoostedEventsController.boostEvent as any
);

router.post('/verify-payment', BoostedEventsController.verifyBoostPayment as any);
router.post('/request', authenticate as any, BoostedEventsController.requestBoost as any);

router.get(
  '/requests',
  authenticate as any,
  requireRole(UserRole.SUPERADMIN) as any,
  requirePermission(SystemPermissions.ADMIN_EVENTS_BOOST) as any,
  BoostedEventsController.getBoostRequests as any
);

router.patch(
  '/:id/status',
  authenticate as any,
  requireRole(UserRole.SUPERADMIN) as any,
  requirePermission(SystemPermissions.ADMIN_EVENTS_BOOST) as any,
  BoostedEventsController.updateBoostStatus as any
);

export default router;
