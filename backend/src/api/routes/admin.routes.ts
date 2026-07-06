import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { AdminController } from '../controllers/admin.controller';
import { authenticate } from '../middleware/auth';
import { requireRole, requirePermission } from '../middleware/authorize';
import { SystemPermissions } from '../../security/system.permissions';

import { authLimiter } from '../middleware/rate-limiter';

const router = Router();

// Public Admin Portal Authentication Endpoint
router.post('/login', authLimiter, AdminController.adminLogin as any);

// Secure all subsequent admin routes to SUPERADMIN
router.use(authenticate as any);
router.use(requireRole(UserRole.SUPERADMIN) as any);

// Integration configs
router.get('/configs/integrations', requirePermission(SystemPermissions.ADMIN_CONFIGS_MANAGE) as any, AdminController.getIntegrationConfigs);
router.put('/configs/integrations/:serviceName', requirePermission(SystemPermissions.ADMIN_CONFIGS_MANAGE) as any, AdminController.updateIntegrationConfig as any);

// Message Templates
router.get('/configs/templates', requirePermission(SystemPermissions.ADMIN_TEMPLATES_MANAGE) as any, AdminController.getMessageTemplates);
router.put('/configs/templates/:templateId', requirePermission(SystemPermissions.ADMIN_TEMPLATES_MANAGE) as any, AdminController.updateMessageTemplate);

// Global settings
router.get('/configs/platform', requirePermission(SystemPermissions.ADMIN_CONFIGS_MANAGE) as any, AdminController.getPlatformSettings);
router.post('/configs/platform', requirePermission(SystemPermissions.ADMIN_CONFIGS_MANAGE) as any, AdminController.updatePlatformSetting);

// Audits & Broadcasts
router.get('/logs/notifications', requirePermission(SystemPermissions.ADMIN_NOTIFICATIONS_BROADCAST) as any, AdminController.getNotificationLogs);
router.post('/notifications/broadcast', requirePermission(SystemPermissions.ADMIN_NOTIFICATIONS_BROADCAST) as any, AdminController.broadcastNotification);

// Moderation
router.get('/events/queue', requirePermission(SystemPermissions.ADMIN_EVENTS_MODERATE) as any, AdminController.getEventQueue);
router.put('/events/:eventId/approve', requirePermission(SystemPermissions.ADMIN_EVENTS_APPROVE) as any, AdminController.approveEvent);

// Escrows & Ledger
router.get('/finance/ledger', requirePermission(SystemPermissions.ADMIN_LEDGER_READ) as any, AdminController.getFinanceLedger);
router.put('/finance/payouts/:hostId', requirePermission(SystemPermissions.ADMIN_PAYOUT_RELEASE) as any, AdminController.payoutHost);

// KYC Review
router.get('/hosts', requirePermission(SystemPermissions.ADMIN_KYC_REVIEW) as any, AdminController.getAllHosts);
router.get('/hosts/kyc/pending', requirePermission(SystemPermissions.ADMIN_KYC_REVIEW) as any, AdminController.getPendingKycHosts);
router.put('/hosts/:hostProfileId/kyc', requirePermission(SystemPermissions.ADMIN_KYC_REVIEW) as any, AdminController.reviewKyc as any);

export default router;
