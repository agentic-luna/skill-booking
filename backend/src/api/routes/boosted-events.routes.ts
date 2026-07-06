import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { BoostedEventsController } from '../controllers/boosted-events.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', BoostedEventsController.getActiveBoostedEvents);
router.post('/', authenticate as any, authorize([UserRole.SUPERADMIN]) as any, BoostedEventsController.boostEvent as any);

export default router;
