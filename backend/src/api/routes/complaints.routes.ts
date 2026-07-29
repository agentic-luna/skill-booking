import { Router } from 'express';
import { createComplaint, getAllComplaints, updateComplaintStatus } from '../controllers/complaints.controller';

const router = Router();

// Create a new complaint (public or authenticated)
router.post('/', createComplaint);

// Admin routes for managing complaints
router.get('/admin', getAllComplaints);
router.patch('/admin/:id/status', updateComplaintStatus);

export default router;
