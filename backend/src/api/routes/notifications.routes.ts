import { Router } from 'express';
import { NotificationsController } from '../controllers/notifications.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate as any);

router.get('/', NotificationsController.getMyNotifications as any);
router.put('/:id/read', NotificationsController.markRead as any);

export default router;
