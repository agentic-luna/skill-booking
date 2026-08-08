import { RefundDecisionTemplateData } from './email.template';

export function generateRefundApprovedWhatsAppTemplate(data: RefundDecisionTemplateData): string {
  const refundAmountText = Number(data.refundAmount || 0).toFixed(2);
  const text = `✅ *REFUND APPROVED!*

Hi *${data.clientName}*, your refund request for *${data.eventTitle}* (Booking #${data.bookingId.substring(0, 8)}) has been approved!

💰 *Refund Amount:* ₹${refundAmountText} INR
The amount will be credited back to your original payment method in 5-7 business days.

Thank you for choosing BookMyTraining!`.trim();

  return JSON.stringify({
    text,
    templateName: 'refund_approved',
    parameters: [
      data.clientName,
      data.eventTitle,
      data.bookingId.substring(0, 8),
      refundAmountText
    ]
  });
}

export function generateRefundDeclinedWhatsAppTemplate(data: RefundDecisionTemplateData): string {
  const reasonText = data.reason || 'Request does not meet refund policy criteria.';
  const text = `⚠️ *REFUND REQUEST UPDATE*

Hi *${data.clientName}*, your refund request for *${data.eventTitle}* (Booking #${data.bookingId.substring(0, 8)}) could not be approved.

Reason: ${reasonText}

Please contact support if you need further assistance. Thank you!`.trim();

  return JSON.stringify({
    text,
    templateName: 'refund_declined',
    parameters: [
      data.clientName,
      data.eventTitle,
      data.bookingId.substring(0, 8),
      reasonText
    ]
  });
}

export function generateRefundApprovedInAppTemplate(data: RefundDecisionTemplateData): string {
  return `Refund of ₹${Number(data.refundAmount || 0).toFixed(2)} approved for booking #${data.bookingId.substring(0, 8)}.`;
}

export function generateRefundDeclinedInAppTemplate(data: RefundDecisionTemplateData): string {
  return `Refund request for booking #${data.bookingId.substring(0, 8)} was declined.`;
}
