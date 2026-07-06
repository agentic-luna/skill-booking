"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalLimiter = exports.webhookLimiter = exports.checkoutLimiter = exports.authLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const commonMessage = (msg) => ({
    success: false,
    error: {
        message: msg,
        code: 'TooManyRequests',
    },
});
// Tight limit on auth endpoints (login, signup, refresh) to prevent brute force
exports.authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 30,
    skip: () => process.env.NODE_ENV === 'test',
    standardHeaders: true,
    legacyHeaders: false,
    message: commonMessage('Too many authentication attempts. Please try again after 15 minutes.'),
});
// Throttle checkouts to protect seat reservations and prevent spam bots
exports.checkoutLimiter = (0, express_rate_limit_1.default)({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 30,
    skip: () => process.env.NODE_ENV === 'test',
    standardHeaders: true,
    legacyHeaders: false,
    message: commonMessage('Too many booking checkout attempts. Please wait a few minutes before trying again.'),
});
// Relaxed limiter for webhooks to handle razorpay burst updates without dropping messages
exports.webhookLimiter = (0, express_rate_limit_1.default)({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 150,
    skip: () => process.env.NODE_ENV === 'test',
    standardHeaders: true,
    legacyHeaders: false,
    message: commonMessage('Webhook rate limit exceeded.'),
});
// General global rate limiter
exports.globalLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 300,
    skip: () => process.env.NODE_ENV === 'test',
    standardHeaders: true,
    legacyHeaders: false,
    message: commonMessage('Too many requests from this IP, please try again later.'),
});
