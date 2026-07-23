"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_1 = require("../middleware/auth");
const rate_limiter_1 = require("../middleware/rate-limiter");
const router = (0, express_1.Router)();
router.post('/otp/send', rate_limiter_1.otpSendLimiter, auth_controller_1.AuthController.sendOtp);
router.post('/otp/verify', rate_limiter_1.authLimiter, auth_controller_1.AuthController.verifyOtp);
router.post('/signup', rate_limiter_1.authLimiter, auth_controller_1.AuthController.signup);
// Client Specific Auth Routes
router.post('/client/otp/send', rate_limiter_1.otpSendLimiter, auth_controller_1.AuthController.clientSendOtp);
router.post('/client/otp/verify', rate_limiter_1.authLimiter, auth_controller_1.AuthController.clientVerifyOtp);
router.post('/client/signup', rate_limiter_1.authLimiter, auth_controller_1.AuthController.clientSignup);
router.post('/login', rate_limiter_1.authLimiter, auth_controller_1.AuthController.login);
// Forgot Password Flow
router.post('/forgot-password/send-otp', rate_limiter_1.otpSendLimiter, auth_controller_1.AuthController.forgotPasswordSendOtp);
router.post('/forgot-password/verify-otp', rate_limiter_1.authLimiter, auth_controller_1.AuthController.forgotPasswordVerifyOtp);
router.post('/forgot-password/reset', rate_limiter_1.authLimiter, auth_controller_1.AuthController.resetPassword);
router.post('/refresh', rate_limiter_1.authLimiter, auth_controller_1.AuthController.refresh);
router.post('/logout', auth_controller_1.AuthController.logout);
router.get('/me', auth_1.authenticate, auth_controller_1.AuthController.me);
exports.default = router;
