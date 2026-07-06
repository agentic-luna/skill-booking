"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const integrations_controller_1 = require("../controllers/integrations.controller");
const auth_1 = require("../middleware/auth");
const authorize_1 = require("../middleware/authorize");
const system_permissions_1 = require("../../security/system.permissions");
const router = (0, express_1.Router)();
// Secure all integration routes to SUPERADMIN
router.use(auth_1.authenticate);
router.use((0, authorize_1.requireRole)(client_1.UserRole.SUPERADMIN));
router.use((0, authorize_1.requirePermission)(system_permissions_1.SystemPermissions.ADMIN_CONFIGS_MANAGE));
router.post('/twilio', integrations_controller_1.IntegrationsController.setupTwilio);
router.post('/sendgrid', integrations_controller_1.IntegrationsController.setupSendgrid);
router.post('/meta-wa', integrations_controller_1.IntegrationsController.setupMetaWa);
router.post('/razorpay', integrations_controller_1.IntegrationsController.setupRazorpay);
exports.default = router;
