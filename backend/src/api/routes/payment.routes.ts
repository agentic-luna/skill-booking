import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';

const router = Router();

/**
 * Public payment configuration
 */
router.get('/razorpay/public-key', PaymentController.getRazorpayPublicKey);

export default router;