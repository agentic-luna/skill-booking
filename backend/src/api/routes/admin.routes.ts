import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { AdminController } from '../controllers/admin.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Secure all admin routes to SUPERADMIN
router.use(authenticate as any);
router.use(authorize([UserRole.SUPERADMIN]) as any);

// Integration configs
router.get('/configs/integrations', AdminController.getIntegrationConfigs);
router.put('/configs/integrations/:serviceName', AdminController.updateIntegrationConfig as any);

// Message Templates
router.get('/configs/templates', AdminController.getMessageTemplates);
router.put('/configs/templates/:templateId', AdminController.updateMessageTemplate);

// Global settings
router.get('/configs/platform', AdminController.getPlatformSettings);
router.post('/configs/platform', AdminController.updatePlatformSetting);

// Audits & Broadcasts
router.get('/logs/notifications', AdminController.getNotificationLogs);
router.post('/notifications/broadcast', AdminController.broadcastNotification);

// Moderation
router.get('/events/queue', AdminController.getEventQueue);
router.put('/events/:eventId/approve', AdminController.approveEvent);

// Escrows & Ledger
router.get('/finance/ledger', AdminController.getFinanceLedger);
router.put('/finance/payouts/:hostId', AdminController.payoutHost);

export default router;
