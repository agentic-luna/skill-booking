import { Router } from 'express';
import { ReviewsController } from '../controllers/reviews.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/', authenticate as any, ReviewsController.createReview as any);
router.get('/event/:eventId', ReviewsController.getEventReviews);

export default router;
