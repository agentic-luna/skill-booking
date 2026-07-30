"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const complaints_controller_1 = require("../controllers/complaints.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const optionalAuth = (req, res, next) => {
    if (req.headers.authorization) {
        return auth_1.authenticate(req, res, next);
    }
    next();
};
// 1. Client Endpoint: Create a new complaint for a booking
router.post('/', optionalAuth, complaints_controller_1.createComplaint);
// 2. Admin Endpoints: Managing & viewing detailed complaints
router.get('/admin', optionalAuth, complaints_controller_1.getAllComplaints);
router.get('/admin/:id', optionalAuth, complaints_controller_1.getComplaintById);
router.get('/:id', optionalAuth, complaints_controller_1.getComplaintById);
router.patch('/admin/:id/status', optionalAuth, complaints_controller_1.updateComplaintStatus);
exports.default = router;
