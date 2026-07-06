import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { UsersController } from '../controllers/users.controller';
import { EventsController } from '../controllers/events.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Secure host routes
router.use(authenticate as any);
router.use(authorize([UserRole.HOST, UserRole.SUPERADMIN]) as any);

router.post('/kyc', UsersController.submitKyc as any);
router.post('/bank-details', UsersController.submitBankDetails as any);
router.put('/bank-details', UsersController.updateBankDetails as any);
router.post('/events', EventsController.createEvent as any);
router.get('/dashboard', UsersController.getDashboard as any);

export default router;
