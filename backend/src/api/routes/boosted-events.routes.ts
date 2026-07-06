import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { BoostedEventsController } from '../controllers/boosted-events.controller';
import { authenticate } from '../middleware/auth';
import { requireRole, requirePermission } from '../middleware/authorize';
import { SystemPermissions } from '../../security/system.permissions';

const router = Router();

router.get('/', BoostedEventsController.getActiveBoostedEvents);
router.post(
  '/',
  authenticate as any,
  requireRole(UserRole.SUPERADMIN) as any,
  requirePermission(SystemPermissions.ADMIN_EVENTS_BOOST) as any,
  BoostedEventsController.boostEvent as any
);

export default router;
