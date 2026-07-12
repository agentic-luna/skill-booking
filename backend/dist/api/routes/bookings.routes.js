"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bookings_controller_1 = require("../controllers/bookings.controller");
const auth_1 = require("../middleware/auth");
const authorize_1 = require("../middleware/authorize");
const rate_limiter_1 = require("../middleware/rate-limiter");
const system_permissions_1 = require("../../security/system.permissions");
const di_container_1 = require("../di-container");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get('/my-bookings', (0, authorize_1.requirePermission)(system_permissions_1.SystemPermissions.CLIENT_BOOKINGS_READ_OWN), bookings_controller_1.BookingsController.getMyBookings);
router.get('/mybookings', (0, authorize_1.requirePermission)(system_permissions_1.SystemPermissions.CLIENT_BOOKINGS_READ_OWN), bookings_controller_1.BookingsController.getMyBookings);
router.get('/:bookingId/invoice', bookings_controller_1.BookingsController.downloadInvoice);
router.post('/checkout', rate_limiter_1.checkoutLimiter, (0, authorize_1.requirePermission)(system_permissions_1.SystemPermissions.CLIENT_BOOKINGS_CREATE), bookings_controller_1.BookingsController.checkout);
router.post('/:bookingId/confirm', (0, authorize_1.requirePermission)(system_permissions_1.SystemPermissions.CLIENT_BOOKINGS_CREATE), (0, authorize_1.requireResourceOwner)(async (req) => {
    const booking = await di_container_1.bookingRepo.findById(req.params.bookingId);
    return booking?.clientId;
}), bookings_controller_1.BookingsController.confirmPayment);
router.post('/:bookingId/confirm-payment', (0, authorize_1.requirePermission)(system_permissions_1.SystemPermissions.CLIENT_BOOKINGS_CREATE), (0, authorize_1.requireResourceOwner)(async (req) => {
    const booking = await di_container_1.bookingRepo.findById(req.params.bookingId);
    return booking?.clientId;
}), bookings_controller_1.BookingsController.confirmPayment);
router.post('/:bookingId/cancel', (0, authorize_1.requirePermission)(system_permissions_1.SystemPermissions.CLIENT_BOOKINGS_CANCEL_OWN), (0, authorize_1.requireResourceOwner)(async (req) => {
    const booking = await di_container_1.bookingRepo.findById(req.params.bookingId);
    return booking?.clientId;
}), bookings_controller_1.BookingsController.cancel);
exports.default = router;
