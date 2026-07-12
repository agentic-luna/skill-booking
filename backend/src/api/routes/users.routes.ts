import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { UsersController } from '../controllers/users.controller';
import { EventsController } from '../controllers/events.controller';
import { authenticate } from '../middleware/auth';
import { requireRole, requirePermission } from '../middleware/authorize';
import { SystemPermissions } from '../../security/system.permissions';

const router = Router();

// Role-agnostic routes (require authentication only)
router.use(authenticate as any);

router.put('/profile', UsersController.updateProfile as any);
router.put('/change-password', UsersController.changePassword as any);
router.post('/apply-host', UsersController.applyHost as any);

// Secure host-specific routes (Host or Superadmin)
router.use(requireRole(UserRole.HOST, UserRole.SUPERADMIN) as any);

router.get('/my-events', UsersController.getMyEvents as any);
router.get('/participants', UsersController.getHostParticipants as any);
router.get('/events/:eventId/bookings', UsersController.getEventBookings as any);

router.post('/kyc', requirePermission(SystemPermissions.HOST_KYC_SUBMIT) as any, UsersController.submitKyc as any);
router.post('/bank-details', requirePermission(SystemPermissions.HOST_BANK_UPDATE) as any, UsersController.submitBankDetails as any);
router.put('/bank-details', requirePermission(SystemPermissions.HOST_BANK_UPDATE) as any, UsersController.updateBankDetails as any);
router.get('/bank-details', requirePermission(SystemPermissions.HOST_BANK_UPDATE) as any, UsersController.getBankDetails as any);
router.post('/events', requirePermission(SystemPermissions.HOST_EVENTS_CREATE) as any, EventsController.createEvent as any);
router.put('/events/:id', requirePermission(SystemPermissions.HOST_EVENTS_UPDATE) as any, EventsController.updateEvent as any);
router.delete('/events/:id', requirePermission(SystemPermissions.HOST_EVENTS_DELETE) as any, EventsController.deleteEvent as any);
router.get('/dashboard', requirePermission(SystemPermissions.HOST_DASHBOARD_READ) as any, UsersController.getDashboard as any);

export default router;
