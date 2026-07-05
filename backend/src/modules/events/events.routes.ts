import { Router } from 'express';
import { EventsController } from './events.controller';

const router = Router();

router.get('/', EventsController.getEvents);
router.get('/:id', EventsController.getEventDetails);

export default router;
