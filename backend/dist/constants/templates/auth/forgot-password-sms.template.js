"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateForgotPasswordSmsTemplate = generateForgotPasswordSmsTemplate;
function generateForgotPasswordSmsTemplate(data) {
    const expiry = data.expiresInMinutes || 10;
    return `[BookMyTraining] Hello${data.userName ? ` ${data.userName}` : ''}, your password reset OTP code is ${data.otp}. Valid for ${expiry} minutes.`;
}
