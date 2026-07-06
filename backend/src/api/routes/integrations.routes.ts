import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { IntegrationsController } from '../controllers/integrations.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Secure all integration routes to SUPERADMIN
router.use(authenticate as any);
router.use(authorize([UserRole.SUPERADMIN]) as any);

router.post('/twilio', IntegrationsController.setupTwilio as any);
router.post('/sendgrid', IntegrationsController.setupSendgrid as any);
router.post('/meta-wa', IntegrationsController.setupMetaWa as any);
router.post('/razorpay', IntegrationsController.setupRazorpay as any);

export default router;
