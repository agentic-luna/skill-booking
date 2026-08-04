import { RefundDecisionTemplateData } from './email.template';

export function generateRefundApprovedWhatsAppTemplate(data: RefundDecisionTemplateData): string {
  return `✅ *REFUND APPROVED!*

Hi *${data.clientName}*, your refund request for *${data.eventTitle}* (Booking #${data.bookingId.substring(0, 8)}) has been approved!

💰 *Refund Amount:* ₹${Number(data.refundAmount || 0).toFixed(2)} INR
The amount will be credited back to your original payment method in 5-7 business days.

Thank you for choosing BookMyTraining!`.trim();
}

export function generateRefundDeclinedWhatsAppTemplate(data: RefundDecisionTemplateData): string {
  return `⚠️ *REFUND REQUEST UPDATE*

Hi *${data.clientName}*, your refund request for *${data.eventTitle}* (Booking #${data.bookingId.substring(0, 8)}) could not be approved.

Reason: ${data.reason || 'Request does not meet refund policy criteria.'}

Please contact support if you need further assistance. Thank you!`.trim();
}

export function generateRefundApprovedInAppTemplate(data: RefundDecisionTemplateData): string {
  return `Refund of ₹${Number(data.refundAmount || 0).toFixed(2)} approved for booking #${data.bookingId.substring(0, 8)}.`;
}

export function generateRefundDeclinedInAppTemplate(data: RefundDecisionTemplateData): string {
  return `Refund request for booking #${data.bookingId.substring(0, 8)} was declined.`;
}
