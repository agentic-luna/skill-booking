import { Router } from 'express';
import { ReviewsController } from '../controllers/reviews.controller';
import { authenticate } from '../middleware/auth';
import { requirePermission } from '../middleware/authorize';
import { SystemPermissions } from '../../security/system.permissions';

const router = Router();

router.post('/', authenticate as any, requirePermission(SystemPermissions.CLIENT_REVIEWS_CREATE) as any, ReviewsController.createReview as any);
router.get('/event/:eventId', ReviewsController.getEventReviews);
router.get('/host/:hostId', ReviewsController.getHostReviews);

export default router;
