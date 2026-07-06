import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { UsersController } from '../controllers/users.controller';
import { EventsController } from '../controllers/events.controller';
import { authenticate } from '../middleware/auth';
import { requireRole, requirePermission } from '../middleware/authorize';
import { SystemPermissions } from '../../security/system.permissions';

const router = Router();

// Secure host routes (Host or Superadmin)
router.use(authenticate as any);
router.use(requireRole(UserRole.HOST, UserRole.SUPERADMIN) as any);

router.post('/kyc', requirePermission(SystemPermissions.HOST_KYC_SUBMIT) as any, UsersController.submitKyc as any);
router.post('/bank-details', requirePermission(SystemPermissions.HOST_BANK_UPDATE) as any, UsersController.submitBankDetails as any);
router.put('/bank-details', requirePermission(SystemPermissions.HOST_BANK_UPDATE) as any, UsersController.updateBankDetails as any);
router.post('/events', requirePermission(SystemPermissions.HOST_EVENTS_CREATE) as any, EventsController.createEvent as any);
router.get('/dashboard', requirePermission(SystemPermissions.HOST_DASHBOARD_READ) as any, UsersController.getDashboard as any);

export default router;
