"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const users_controller_1 = require("../controllers/users.controller");
const events_controller_1 = require("../controllers/events.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Secure host routes
router.use(auth_1.authenticate);
router.use((0, auth_1.authorize)([client_1.UserRole.HOST, client_1.UserRole.SUPERADMIN]));
router.post('/kyc', users_controller_1.UsersController.submitKyc);
router.post('/bank-details', users_controller_1.UsersController.submitBankDetails);
router.put('/bank-details', users_controller_1.UsersController.updateBankDetails);
router.post('/events', events_controller_1.EventsController.createEvent);
router.get('/dashboard', users_controller_1.UsersController.getDashboard);
exports.default = router;
