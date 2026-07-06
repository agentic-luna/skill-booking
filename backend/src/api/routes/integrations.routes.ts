import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { IntegrationsController } from '../controllers/integrations.controller';
import { authenticate } from '../middleware/auth';
import { requireRole, requirePermission } from '../middleware/authorize';
import { SystemPermissions } from '../../security/system.permissions';

const router = Router();

// Secure all integration routes to SUPERADMIN
router.use(authenticate as any);
router.use(requireRole(UserRole.SUPERADMIN) as any);
router.use(requirePermission(SystemPermissions.ADMIN_CONFIGS_MANAGE) as any);

router.post('/twilio', IntegrationsController.setupTwilio as any);
router.post('/sendgrid', IntegrationsController.setupSendgrid as any);
router.post('/meta-wa', IntegrationsController.setupMetaWa as any);
router.post('/razorpay', IntegrationsController.setupRazorpay as any);

export default router;
