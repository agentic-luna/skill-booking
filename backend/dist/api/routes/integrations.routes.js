"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const integrations_controller_1 = require("../controllers/integrations.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Secure all integration routes to SUPERADMIN
router.use(auth_1.authenticate);
router.use((0, auth_1.authorize)([client_1.UserRole.SUPERADMIN]));
router.post('/twilio', integrations_controller_1.IntegrationsController.setupTwilio);
router.post('/sendgrid', integrations_controller_1.IntegrationsController.setupSendgrid);
router.post('/meta-wa', integrations_controller_1.IntegrationsController.setupMetaWa);
router.post('/razorpay', integrations_controller_1.IntegrationsController.setupRazorpay);
exports.default = router;
