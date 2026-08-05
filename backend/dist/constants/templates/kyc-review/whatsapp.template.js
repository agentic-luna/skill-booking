"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateKycApprovedWhatsAppTemplate = generateKycApprovedWhatsAppTemplate;
exports.generateKycRejectedWhatsAppTemplate = generateKycRejectedWhatsAppTemplate;
exports.generateKycApprovedInAppTemplate = generateKycApprovedInAppTemplate;
exports.generateKycRejectedInAppTemplate = generateKycRejectedInAppTemplate;
function generateKycApprovedWhatsAppTemplate(data) {
    return `🎉 *KYC VERIFIED & APPROVED!*

Hi *${data.hostName}*, your Host KYC verification has been approved! 🚀

You can now publish workshops, schedule live sessions, and receive earnings directly to your bank account.

Welcome aboard BookMyTraining!`.trim();
}
function generateKycRejectedWhatsAppTemplate(data) {
    return `⚠️ *KYC VERIFICATION UPDATE*

Hi *${data.hostName}*, your KYC submission could not be approved.

Reason: ${data.rejectionReason || 'Documents provided were incomplete or invalid.'}

Please log into your Host Dashboard to re-upload valid documents. Thank you!`.trim();
}
function generateKycApprovedInAppTemplate(data) {
    return `Your Host KYC verification has been approved! You can now publish events and receive payouts.`;
}
function generateKycRejectedInAppTemplate(data) {
    return `Your Host KYC verification was rejected. Reason: ${data.rejectionReason || 'Documents incomplete'}`;
}
