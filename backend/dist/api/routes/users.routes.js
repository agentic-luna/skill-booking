"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const users_controller_1 = require("../controllers/users.controller");
const events_controller_1 = require("../controllers/events.controller");
const auth_1 = require("../middleware/auth");
const authorize_1 = require("../middleware/authorize");
const system_permissions_1 = require("../../security/system.permissions");
const router = (0, express_1.Router)();
// Secure host routes (Host or Superadmin)
router.use(auth_1.authenticate);
router.use((0, authorize_1.requireRole)(client_1.UserRole.HOST, client_1.UserRole.SUPERADMIN));
router.post('/kyc', (0, authorize_1.requirePermission)(system_permissions_1.SystemPermissions.HOST_KYC_SUBMIT), users_controller_1.UsersController.submitKyc);
router.post('/bank-details', (0, authorize_1.requirePermission)(system_permissions_1.SystemPermissions.HOST_BANK_UPDATE), users_controller_1.UsersController.submitBankDetails);
router.put('/bank-details', (0, authorize_1.requirePermission)(system_permissions_1.SystemPermissions.HOST_BANK_UPDATE), users_controller_1.UsersController.updateBankDetails);
router.post('/events', (0, authorize_1.requirePermission)(system_permissions_1.SystemPermissions.HOST_EVENTS_CREATE), events_controller_1.EventsController.createEvent);
router.get('/dashboard', (0, authorize_1.requirePermission)(system_permissions_1.SystemPermissions.HOST_DASHBOARD_READ), users_controller_1.UsersController.getDashboard);
exports.default = router;
