import { Router } from 'express';
import { EventsController } from '../controllers/events.controller';
import { authenticate } from '../middleware/auth';
import { requirePermission } from '../middleware/authorize';
import { SystemPermissions } from '../../security/system.permissions';

const router = Router();

router.get('/', EventsController.getEvents);
router.get('/liked', authenticate as any, requirePermission(SystemPermissions.CLIENT_LIKES_MANAGE) as any, EventsController.getLikedEvents as any);
router.get('/:id', EventsController.getEventDetails);
router.get('/:id/ticket-types', EventsController.getEventTicketTypes);
router.post('/:id/like', authenticate as any, requirePermission(SystemPermissions.CLIENT_LIKES_MANAGE) as any, EventsController.toggleLike as any);

export default router;
