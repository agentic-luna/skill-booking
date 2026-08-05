"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const admin_controller_1 = require("../controllers/admin.controller");
const auth_1 = require("../middleware/auth");
const authorize_1 = require("../middleware/authorize");
const system_permissions_1 = require("../../security/system.permissions");
const rate_limiter_1 = require("../middleware/rate-limiter");
const router = (0, express_1.Router)();
// Public Admin Portal Authentication Endpoint
router.post('/login', rate_limiter_1.authLimiter, admin_controller_1.AdminController.adminLogin);
// Secure all subsequent admin routes to SUPERADMIN
router.use(auth_1.authenticate);
router.use((0, authorize_1.requireRole)(client_1.UserRole.SUPERADMIN));
// Disable browser caching for secure admin actions
router.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
});
// Integration configs
router.get('/configs/integrations', (0, authorize_1.requirePermission)(system_permissions_1.SystemPermissions.ADMIN_CONFIGS_MANAGE), admin_controller_1.AdminController.getIntegrationConfigs);
router.put('/configs/integrations/:serviceName', (0, authorize_1.requirePermission)(system_permissions_1.SystemPermissions.ADMIN_CONFIGS_MANAGE), admin_controller_1.AdminController.updateIntegrationConfig);
// Global settings
router.get('/configs/platform', (0, authorize_1.requirePermission)(system_permissions_1.SystemPermissions.ADMIN_CONFIGS_MANAGE), admin_controller_1.AdminController.getPlatformSettings);
router.post('/configs/platform', (0, authorize_1.requirePermission)(system_permissions_1.SystemPermissions.ADMIN_CONFIGS_MANAGE), admin_controller_1.AdminController.updatePlatformSetting);
// Audits & Broadcasts
router.get('/logs/notifications', (0, authorize_1.requirePermission)(system_permissions_1.SystemPermissions.ADMIN_NOTIFICATIONS_BROADCAST), admin_controller_1.AdminController.getNotificationLogs);
router.post('/notifications/broadcast', (0, authorize_1.requirePermission)(system_permissions_1.SystemPermissions.ADMIN_NOTIFICATIONS_BROADCAST), admin_controller_1.AdminController.broadcastNotification);
// Moderation
router.get('/events/queue', (0, authorize_1.requirePermission)(system_permissions_1.SystemPermissions.ADMIN_EVENTS_MODERATE), admin_controller_1.AdminController.getEventQueue);
router.put('/events/:eventId/approve', (0, authorize_1.requirePermission)(system_permissions_1.SystemPermissions.ADMIN_EVENTS_APPROVE), admin_controller_1.AdminController.approveEvent);
router.put('/events/:eventId/decline', (0, authorize_1.requirePermission)(system_permissions_1.SystemPermissions.ADMIN_EVENTS_APPROVE), admin_controller_1.AdminController.declineEvent);
// --- Edit Requests ---
router.get('/edit-requests', (0, authorize_1.requirePermission)(system_permissions_1.SystemPermissions.ADMIN_EVENTS_APPROVE), admin_controller_1.AdminController.getEditRequests);
router.put('/edit-requests/:id/approve', (0, authorize_1.requirePermission)(system_permissions_1.SystemPermissions.ADMIN_EVENTS_APPROVE), admin_controller_1.AdminController.approveEditRequest);
router.put('/edit-requests/:id/reject', (0, authorize_1.requirePermission)(system_permissions_1.SystemPermissions.ADMIN_EVENTS_APPROVE), admin_controller_1.AdminController.rejectEditRequest);
// Escrows & Ledger
router.get('/finance/ledger', (0, authorize_1.requirePermission)(system_permissions_1.SystemPermissions.ADMIN_LEDGER_READ), admin_controller_1.AdminController.getFinanceLedger);
router.get('/finance/event-payouts', (0, authorize_1.requirePermission)(system_permissions_1.SystemPermissions.ADMIN_LEDGER_READ), admin_controller_1.AdminController.getEventPayouts);
router.put('/finance/event-payouts/:eventId/payout', (0, authorize_1.requirePermission)(system_permissions_1.SystemPermissions.ADMIN_PAYOUT_RELEASE), admin_controller_1.AdminController.payoutEvent);
router.put('/finance/payouts/:hostId', (0, authorize_1.requirePermission)(system_permissions_1.SystemPermissions.ADMIN_PAYOUT_RELEASE), admin_controller_1.AdminController.payoutHost);
router.get('/finance/refund-requests', (0, authorize_1.requirePermission)(system_permissions_1.SystemPermissions.ADMIN_LEDGER_READ), admin_controller_1.AdminController.getRefundRequests);
router.put('/finance/refund-requests/:id/approve', (0, authorize_1.requirePermission)(system_permissions_1.SystemPermissions.ADMIN_PAYOUT_RELEASE), admin_controller_1.AdminController.approveRefundRequest);
router.put('/finance/refund-requests/:id/decline', (0, authorize_1.requirePermission)(system_permissions_1.SystemPermissions.ADMIN_PAYOUT_RELEASE), admin_controller_1.AdminController.declineRefundRequest);
// KYC Review & Host Management
router.get('/hosts', (0, authorize_1.requirePermission)(system_permissions_1.SystemPermissions.ADMIN_KYC_REVIEW), admin_controller_1.AdminController.getAllHosts);
router.get('/hosts/kyc/pending', (0, authorize_1.requirePermission)(system_permissions_1.SystemPermissions.ADMIN_KYC_REVIEW), admin_controller_1.AdminController.getPendingKycHosts);
router.put('/hosts/:hostProfileId/kyc', (0, authorize_1.requirePermission)(system_permissions_1.SystemPermissions.ADMIN_KYC_REVIEW), admin_controller_1.AdminController.reviewKyc);
router.delete('/hosts/:id', (0, authorize_1.requirePermission)(system_permissions_1.SystemPermissions.ADMIN_KYC_REVIEW), admin_controller_1.AdminController.deleteHost);
router.post('/hosts/:id/notify', (0, authorize_1.requirePermission)(system_permissions_1.SystemPermissions.ADMIN_NOTIFICATIONS_BROADCAST), admin_controller_1.AdminController.notifyHost);
exports.default = router;
