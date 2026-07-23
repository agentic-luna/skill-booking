import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { authLimiter, otpSendLimiter } from '../middleware/rate-limiter';

const router = Router();

router.post('/otp/send', otpSendLimiter, AuthController.sendOtp);
router.post('/otp/verify', authLimiter, AuthController.verifyOtp);
router.post('/signup', authLimiter, AuthController.signup);

// Client Specific Auth Routes
router.post('/client/otp/send', otpSendLimiter, AuthController.clientSendOtp);
router.post('/client/otp/verify', authLimiter, AuthController.clientVerifyOtp);
router.post('/client/signup', authLimiter, AuthController.clientSignup);
router.post('/login', authLimiter, AuthController.login);

// Forgot Password Flow
router.post('/forgot-password/send-otp', otpSendLimiter, AuthController.forgotPasswordSendOtp);
router.post('/forgot-password/verify-otp', authLimiter, AuthController.forgotPasswordVerifyOtp);
router.post('/forgot-password/reset', authLimiter, AuthController.resetPassword);

router.post('/refresh', authLimiter, AuthController.refresh);
router.post('/logout', AuthController.logout);
router.get('/me', authenticate as any, AuthController.me as any);

export default router;
