import rateLimit from 'express-rate-limit';

const commonMessage = (msg: string) => ({
  success: false,
  error: {
    message: msg,
    code: 'TooManyRequests',
  },
});

// Tight limit on auth endpoints (login, signup, refresh) to prevent brute force
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30,
  skip: () => process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development',
  standardHeaders: true,
  legacyHeaders: false,
  message: commonMessage('Too many authentication attempts. Please try again after 15 minutes.'),
});

// Throttle checkouts to protect seat reservations and prevent spam bots
export const checkoutLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 30,
  skip: () => process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development',
  standardHeaders: true,
  legacyHeaders: false,
  message: commonMessage('Too many booking checkout attempts. Please wait a few minutes before trying again.'),
});

// Relaxed limiter for webhooks to handle razorpay burst updates without dropping messages
export const webhookLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 150,
  skip: () => process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development',
  standardHeaders: true,
  legacyHeaders: false,
  message: commonMessage('Webhook rate limit exceeded.'),
});

// General global rate limiter
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  skip: () => process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development',
  standardHeaders: true,
  legacyHeaders: false,
  message: commonMessage('Too many requests from this IP, please try again later.'),
});
