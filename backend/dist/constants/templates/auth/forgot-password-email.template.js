"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateForgotPasswordEmailTemplate = generateForgotPasswordEmailTemplate;
function generateForgotPasswordEmailTemplate(data) {
    const expiry = data.expiresInMinutes || 10;
    return `
<div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px;">
  <div style="background: linear-gradient(135deg, #1e293b, #475569); padding: 24px; border-radius: 12px; text-align: center; color: #ffffff;">
    <h2 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 0.5px;">PASSWORD RESET CODE</h2>
    <p style="margin: 6px 0 0 0; font-size: 13px; color: #cbd5e1;">BOOKMYTRAINING SECURITY</p>
  </div>
  <div style="padding: 24px 8px 12px 8px; text-align: center;">
    <p style="font-size: 15px; color: #374151; margin-top: 0; text-align: left;">Hi <strong>${data.userName}</strong>,</p>
    <p style="font-size: 14px; color: #4b5563; line-height: 1.5; text-align: left;">We received a request to reset your BookMyTraining account password. Enter the code below to proceed with resetting your password:</p>
    
    <div style="background-color: #f8fafc; border: 2px dashed #64748b; border-radius: 12px; padding: 18px; margin: 24px 0; display: inline-block; min-width: 200px;">
      <span style="font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #0f172a; font-family: monospace;">${data.otp}</span>
    </div>

    <p style="font-size: 13px; color: #6b7280;">This code is valid for <strong>${expiry} minutes</strong>. If you did not request a password reset, you can safely ignore this email.</p>
  </div>
  <div style="border-top: 1px solid #f3f4f6; padding-top: 16px; margin-top: 20px; text-align: center; font-size: 12px; color: #9ca3af;">
    BookMyTraining Platform &bull; Account Security
  </div>
</div>`.trim();
}
