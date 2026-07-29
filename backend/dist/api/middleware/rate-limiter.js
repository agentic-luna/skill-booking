"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalLimiter = exports.webhookLimiter = exports.checkoutLimiter = exports.otpSendLimiter = exports.authLimiter = exports.userRateLimitKeyGenerator = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const commonMessage = (msg) => ({
    success: false,
    error: {
        message: msg,
        code: 'TooManyRequests',
    },
});
const isEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
const userRateLimitKeyGenerator = (req) => {
    let email = '';
    let phone = '';
    // 1. Extract from req.user (if authenticated)
    if (req.user) {
        if (req.user.email)
            email = req.user.email.trim().toLowerCase();
        if (req.user.phone)
            phone = req.user.phone.trim();
    }
    // 2. Extract from req.body
    if (req.body) {
        if (typeof req.body.email === 'string') {
            email = req.body.email.trim().toLowerCase();
        }
        if (typeof req.body.phone === 'string') {
            phone = req.body.phone.trim();
        }
        if (typeof req.body.phoneNumber === 'string') {
            phone = req.body.phoneNumber.trim();
        }
        if (typeof req.body.whatsappNumber === 'string') {
            phone = req.body.whatsappNumber.trim();
        }
        if (typeof req.body.target === 'string') {
            const target = req.body.target.trim();
            if (isEmail(target)) {
                email = target.toLowerCase();
            }
            else {
                phone = target;
            }
        }
        if (typeof req.body.identifier === 'string') {
            const identifier = req.body.identifier.trim();
            if (isEmail(identifier)) {
                email = identifier.toLowerCase();
            }
            else {
                phone = identifier;
            }
        }
        if (typeof req.body.username === 'string') {
            const username = req.body.username.trim();
            if (isEmail(username)) {
                email = username.toLowerCase();
            }
            else {
                phone = username;
            }
        }
    }
    // 3. Extract from req.query
    if (req.query) {
        if (typeof req.query.email === 'string') {
            email = req.query.email.trim().toLowerCase();
        }
        if (typeof req.query.phone === 'string') {
            phone = req.query.phone.trim();
        }
    }
    // Build the rate limit key
    const key = (email && phone)
        ? `email_phone:${email}_${phone}`
        : email
            ? `email:${email}`
            : phone
                ? `phone:${phone}`
                : `ip:${req.ip || ''}`;
    console.log(`[RateLimit] req.ip: ${req.ip}, email: "${email}", phone: "${phone}", generated key: "${key}"`);
    return key;
};
exports.userRateLimitKeyGenerator = userRateLimitKeyGenerator;
// Tight limit on auth endpoints (login, signup, refresh) to prevent brute force
exports.authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 30,
    skip: () => process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development',
    keyGenerator: exports.userRateLimitKeyGenerator,
    standardHeaders: true,
    legacyHeaders: false,
    message: commonMessage('Too many authentication attempts. Please try again after 15 minutes.'),
});
// Strict rate limit on OTP generation endpoints: max 3 OTPs per 1 hour window
exports.otpSendLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3,
    keyGenerator: exports.userRateLimitKeyGenerator,
    standardHeaders: true,
    legacyHeaders: false,
    message: commonMessage('Maximum 3 OTP requests allowed per hour. Please try again after 1 hour.'),
});
// Throttle checkouts to protect seat reservations and prevent spam bots
exports.checkoutLimiter = (0, express_rate_limit_1.default)({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 30,
    skip: () => process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development',
    keyGenerator: exports.userRateLimitKeyGenerator,
    standardHeaders: true,
    legacyHeaders: false,
    message: commonMessage('Too many booking checkout attempts. Please wait a few minutes before trying again.'),
});
// Relaxed limiter for webhooks to handle razorpay burst updates without dropping messages
exports.webhookLimiter = (0, express_rate_limit_1.default)({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 150,
    skip: () => process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development',
    keyGenerator: exports.userRateLimitKeyGenerator,
    standardHeaders: true,
    legacyHeaders: false,
    message: commonMessage('Webhook rate limit exceeded.'),
});
// General global rate limiter
exports.globalLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 300,
    skip: () => process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development',
    keyGenerator: exports.userRateLimitKeyGenerator,
    standardHeaders: true,
    legacyHeaders: false,
    message: commonMessage('Too many requests from this IP, please try again later.'),
});
