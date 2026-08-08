import { KycReviewTemplateData } from './email.template';

export function generateKycApprovedWhatsAppTemplate(data: KycReviewTemplateData): string {
  const text = `🎉 *KYC VERIFIED & APPROVED!*

Hi *${data.hostName}*, your Host KYC verification has been approved! 🚀

You can now publish workshops, schedule live sessions, and receive earnings directly to your bank account.

Welcome aboard BookMyTraining!`.trim();

  return JSON.stringify({
    text,
    templateName: 'kyc_approved',
    parameters: [
      data.hostName
    ]
  });
}

export function generateKycRejectedWhatsAppTemplate(data: KycReviewTemplateData): string {
  const reasonText = data.rejectionReason || 'Documents provided were incomplete or invalid.';
  const text = `⚠️ *KYC VERIFICATION UPDATE*

Hi *${data.hostName}*, your KYC submission could not be approved.

Reason: ${reasonText}

Please log into your Host Dashboard to re-upload valid documents. Thank you!`.trim();

  return JSON.stringify({
    text,
    templateName: 'kyc_rejected',
    parameters: [
      data.hostName,
      reasonText
    ]
  });
}

export function generateKycApprovedInAppTemplate(data: KycReviewTemplateData): string {
  return `Your Host KYC verification has been approved! You can now publish events and receive payouts.`;
}

export function generateKycRejectedInAppTemplate(data: KycReviewTemplateData): string {
  return `Your Host KYC verification was rejected. Reason: ${data.rejectionReason || 'Documents incomplete'}`;
}
