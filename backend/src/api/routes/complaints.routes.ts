import { Router } from 'express';
import { createComplaint, getAllComplaints, getComplaintById, updateComplaintStatus } from '../controllers/complaints.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

const optionalAuth = (req: any, res: any, next: any) => {
  if (req.headers.authorization) {
    return (authenticate as any)(req, res, next);
  }
  next();
};

// 1. Client Endpoint: Create a new complaint for a booking
router.post('/', optionalAuth, createComplaint);

// 2. Admin Endpoints: Managing & viewing detailed complaints
router.get('/admin', optionalAuth, getAllComplaints);
router.get('/admin/:id', optionalAuth, getComplaintById);
router.get('/:id', optionalAuth, getComplaintById);
router.patch('/admin/:id/status', optionalAuth, updateComplaintStatus);

export default router;
