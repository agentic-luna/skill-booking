"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateHostSmsOtpTemplate = generateHostSmsOtpTemplate;
function generateHostSmsOtpTemplate(data) {
    const expiry = data.expiresInMinutes || 10;
    return `[BookMyTraining] Your Host registration OTP is ${data.otp}. Valid for ${expiry} minutes. Do not share code with anyone.`;
}
