"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const complaints_controller_1 = require("../controllers/complaints.controller");
const router = (0, express_1.Router)();
// Create a new complaint (public or authenticated)
router.post('/', complaints_controller_1.createComplaint);
// Admin routes for managing complaints
router.get('/admin', complaints_controller_1.getAllComplaints);
router.patch('/admin/:id/status', complaints_controller_1.updateComplaintStatus);
exports.default = router;
