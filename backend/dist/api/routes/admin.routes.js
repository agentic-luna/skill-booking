"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const admin_controller_1 = require("../controllers/admin.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Secure all admin routes to SUPERADMIN
router.use(auth_1.authenticate);
router.use((0, auth_1.authorize)([client_1.UserRole.SUPERADMIN]));
// Integration configs
router.get('/configs/integrations', admin_controller_1.AdminController.getIntegrationConfigs);
router.put('/configs/integrations/:serviceName', admin_controller_1.AdminController.updateIntegrationConfig);
// Message Templates
router.get('/configs/templates', admin_controller_1.AdminController.getMessageTemplates);
router.put('/configs/templates/:templateId', admin_controller_1.AdminController.updateMessageTemplate);
// Global settings
router.get('/configs/platform', admin_controller_1.AdminController.getPlatformSettings);
router.post('/configs/platform', admin_controller_1.AdminController.updatePlatformSetting);
// Audits & Broadcasts
router.get('/logs/notifications', admin_controller_1.AdminController.getNotificationLogs);
router.post('/notifications/broadcast', admin_controller_1.AdminController.broadcastNotification);
// Moderation
router.get('/events/queue', admin_controller_1.AdminController.getEventQueue);
router.put('/events/:eventId/approve', admin_controller_1.AdminController.approveEvent);
// Escrows & Ledger
router.get('/finance/ledger', admin_controller_1.AdminController.getFinanceLedger);
router.put('/finance/payouts/:hostId', admin_controller_1.AdminController.payoutHost);
exports.default = router;
