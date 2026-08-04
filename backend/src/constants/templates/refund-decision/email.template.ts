export interface RefundDecisionTemplateData {
  clientName: string;
  bookingId: string;
  eventTitle: string;
  refundAmount?: number;
  status: 'APPROVED' | 'DECLINED';
  reason?: string;
}

export function generateRefundApprovedEmailTemplate(data: RefundDecisionTemplateData): string {
  return `
<div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px;">
  <div style="background: linear-gradient(135deg, #064e3b, #10b981); padding: 24px; border-radius: 12px; text-align: center; color: #ffffff;">
    <h2 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 0.5px;">REFUND APPROVED</h2>
    <p style="margin: 6px 0 0 0; font-size: 13px; color: #a7f3d0;">BOOKMYTRAINING REFUND CONFIRMATION</p>
  </div>
  <div style="padding: 24px 8px 12px 8px;">
    <p style="font-size: 16px; color: #111827; margin-top: 0;">Hi <strong>${data.clientName}</strong>,</p>
    <p style="font-size: 14px; color: #4b5563; line-height: 1.5;">Your refund request for booking <strong>#${data.bookingId.substring(0, 8)}</strong> (${data.eventTitle}) has been <strong>APPROVED</strong> by our customer care team.</p>

    <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; margin: 20px 0;">
      <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #374151;">
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Booking Reference:</td>
          <td style="padding: 8px 0; text-align: right; font-weight: 700; font-family: monospace;">#${data.bookingId.substring(0, 8)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Event Title:</td>
          <td style="padding: 8px 0; text-align: right; font-weight: 600;">${data.eventTitle}</td>
        </tr>
        <tr style="border-top: 1px solid #bbf7d0;">
          <td style="padding: 12px 0 0 0; color: #064e3b; font-weight: 800; font-size: 16px;">Approved Refund Amount:</td>
          <td style="padding: 12px 0 0 0; text-align: right; font-weight: 800; font-size: 16px; color: #064e3b;">₹${Number(data.refundAmount || 0).toFixed(2)} INR</td>
        </tr>
      </table>
    </div>

    <p style="font-size: 13px; color: #6b7280; line-height: 1.5;">The refunded amount will be credited back to your original payment method within 5-7 business days.</p>
  </div>
  <div style="border-top: 1px solid #f3f4f6; padding-top: 16px; text-align: center; font-size: 12px; color: #9ca3af;">
    BookMyTraining Platform &bull; Customer Care
  </div>
</div>`.trim();
}

export function generateRefundDeclinedEmailTemplate(data: RefundDecisionTemplateData): string {
  return `
<div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px;">
  <div style="background: linear-gradient(135deg, #991b1b, #ef4444); padding: 24px; border-radius: 12px; text-align: center; color: #ffffff;">
    <h2 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 0.5px;">REFUND REQUEST UPDATE</h2>
    <p style="margin: 6px 0 0 0; font-size: 13px; color: #fca5a5;">BOOKMYTRAINING REFUND DECISION</p>
  </div>
  <div style="padding: 24px 8px 12px 8px;">
    <p style="font-size: 16px; color: #111827; margin-top: 0;">Hi <strong>${data.clientName}</strong>,</p>
    <p style="font-size: 14px; color: #4b5563; line-height: 1.5;">Thank you for contacting customer care. We have reviewed your refund request for booking <strong>#${data.bookingId.substring(0, 8)}</strong> (${data.eventTitle}). Unfortunately, it could not be approved based on our cancellation policy.</p>

    <div style="background-color: #fef2f2; border: 1px solid #fee2e2; border-radius: 12px; padding: 16px; margin: 20px 0;">
      <p style="font-size: 14px; color: #991b1b; margin: 0; font-weight: 600;">Reason / Note:</p>
      <p style="font-size: 14px; color: #7f1d1d; margin: 6px 0 0 0;">${data.reason || 'Request does not meet standard refund policy criteria.'}</p>
    </div>

    <p style="font-size: 13px; color: #6b7280; line-height: 1.5;">If you believe this decision was made in error, please reach out to platform support.</p>
  </div>
  <div style="border-top: 1px solid #f3f4f6; padding-top: 16px; text-align: center; font-size: 12px; color: #9ca3af;">
    BookMyTraining Platform &bull; Customer Care
  </div>
</div>`.trim();
}
