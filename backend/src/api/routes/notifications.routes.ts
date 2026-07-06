import { Router } from 'express';
import { NotificationsController } from '../controllers/notifications.controller';
import { authenticate } from '../middleware/auth';
import { requirePermission } from '../middleware/authorize';
import { SystemPermissions } from '../../security/system.permissions';

const router = Router();

router.use(authenticate as any);
router.use(requirePermission(SystemPermissions.AUTH_PROFILE_READ) as any);

router.get('/', NotificationsController.getMyNotifications as any);
router.put('/:id/read', NotificationsController.markRead as any);

export default router;
