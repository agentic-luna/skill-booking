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
// Role-agnostic routes (require authentication only)
router.use(auth_1.authenticate);
router.put('/profile', users_controller_1.UsersController.updateProfile);
router.put('/change-password', users_controller_1.UsersController.changePassword);
router.post('/apply-host', users_controller_1.UsersController.applyHost);
// Secure host-specific routes (Host or Superadmin)
router.use((0, authorize_1.requireRole)(client_1.UserRole.HOST, client_1.UserRole.SUPERADMIN));
router.get('/my-events', users_controller_1.UsersController.getMyEvents);
router.get('/participants', users_controller_1.UsersController.getHostParticipants);
router.get('/events/:eventId/bookings', users_controller_1.UsersController.getEventBookings);
router.post('/kyc', (0, authorize_1.requirePermission)(system_permissions_1.SystemPermissions.HOST_KYC_SUBMIT), users_controller_1.UsersController.submitKyc);
router.post('/bank-details', (0, authorize_1.requirePermission)(system_permissions_1.SystemPermissions.HOST_BANK_UPDATE), users_controller_1.UsersController.submitBankDetails);
router.put('/bank-details', (0, authorize_1.requirePermission)(system_permissions_1.SystemPermissions.HOST_BANK_UPDATE), users_controller_1.UsersController.updateBankDetails);
router.get('/bank-details', (0, authorize_1.requirePermission)(system_permissions_1.SystemPermissions.HOST_BANK_UPDATE), users_controller_1.UsersController.getBankDetails);
router.post('/events', (0, authorize_1.requirePermission)(system_permissions_1.SystemPermissions.HOST_EVENTS_CREATE), events_controller_1.EventsController.createEvent);
router.put('/events/:id', (0, authorize_1.requirePermission)(system_permissions_1.SystemPermissions.HOST_EVENTS_UPDATE), events_controller_1.EventsController.updateEvent);
router.delete('/events/:id', (0, authorize_1.requirePermission)(system_permissions_1.SystemPermissions.HOST_EVENTS_DELETE), events_controller_1.EventsController.deleteEvent);
router.get('/dashboard', (0, authorize_1.requirePermission)(system_permissions_1.SystemPermissions.HOST_DASHBOARD_READ), users_controller_1.UsersController.getDashboard);
exports.default = router;
