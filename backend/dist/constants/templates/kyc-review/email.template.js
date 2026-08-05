"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateKycApprovedEmailTemplate = generateKycApprovedEmailTemplate;
exports.generateKycRejectedEmailTemplate = generateKycRejectedEmailTemplate;
function generateKycApprovedEmailTemplate(data) {
    return `
<div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px;">
  <div style="background: linear-gradient(135deg, #064e3b, #10b981); padding: 24px; border-radius: 12px; text-align: center; color: #ffffff;">
    <h2 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 0.5px;">KYC VERIFIED & APPROVED!</h2>
    <p style="margin: 6px 0 0 0; font-size: 13px; color: #a7f3d0;">BOOKMYTRAINING HOST VERIFICATION</p>
  </div>
  <div style="padding: 24px 8px 12px 8px;">
    <p style="font-size: 16px; color: #111827; margin-top: 0;">Hi <strong>${data.hostName}</strong>,</p>
    <p style="font-size: 14px; color: #4b5563; line-height: 1.5;">Congratulations! Your Host KYC verification has been officially reviewed and <strong>APPROVED</strong> by the BookMyTraining verification team.</p>
    <p style="font-size: 14px; color: #4b5563; line-height: 1.5;">You can now publish workshops, set custom ticket prices, host live training sessions, and receive direct payouts to your bank account.</p>
  </div>
  <div style="border-top: 1px solid #f3f4f6; padding-top: 16px; text-align: center; font-size: 12px; color: #9ca3af;">
    BookMyTraining Platform &bull; Host Verification Team
  </div>
</div>`.trim();
}
function generateKycRejectedEmailTemplate(data) {
    return `
<div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px;">
  <div style="background: linear-gradient(135deg, #991b1b, #ef4444); padding: 24px; border-radius: 12px; text-align: center; color: #ffffff;">
    <h2 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 0.5px;">KYC VERIFICATION UPDATE</h2>
    <p style="margin: 6px 0 0 0; font-size: 13px; color: #fca5a5;">BOOKMYTRAINING HOST VERIFICATION</p>
  </div>
  <div style="padding: 24px 8px 12px 8px;">
    <p style="font-size: 16px; color: #111827; margin-top: 0;">Hi <strong>${data.hostName}</strong>,</p>
    <p style="font-size: 14px; color: #4b5563; line-height: 1.5;">Thank you for submitting your KYC verification details. Unfortunately, your verification could not be approved at this time.</p>
    
    <div style="background-color: #fef2f2; border: 1px solid #fee2e2; border-radius: 12px; padding: 16px; margin: 20px 0;">
      <p style="font-size: 14px; color: #991b1b; margin: 0; font-weight: 600;">Rejection Reason:</p>
      <p style="font-size: 14px; color: #7f1d1d; margin: 6px 0 0 0;">${data.rejectionReason || 'Documents provided were incomplete or invalid.'}</p>
    </div>

    <p style="font-size: 13px; color: #6b7280; line-height: 1.5;">Please log into your Host Dashboard to update your identity documents or bank details and resubmit for verification.</p>
  </div>
  <div style="border-top: 1px solid #f3f4f6; padding-top: 16px; text-align: center; font-size: 12px; color: #9ca3af;">
    BookMyTraining Platform &bull; Host Verification Team
  </div>
</div>`.trim();
}
