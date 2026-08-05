"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCancelBookingEmailTemplate = generateCancelBookingEmailTemplate;
function generateCancelBookingEmailTemplate(data) {
    return `
<div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px;">
  <div style="background: linear-gradient(135deg, #991b1b, #ef4444); padding: 24px; border-radius: 12px; text-align: center; color: #ffffff;">
    <h2 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 0.5px;">BOOKING CANCELLED</h2>
    <p style="margin: 6px 0 0 0; font-size: 13px; color: #fca5a5;">CANCELLATION & REFUND INFORMATION</p>
  </div>
  <div style="padding: 24px 8px 12px 8px;">
    <p style="font-size: 16px; color: #111827; margin-top: 0;">Hi <strong>${data.userName}</strong>,</p>
    <p style="font-size: 14px; color: #4b5563; line-height: 1.5;">Your booking for <strong>${data.eventTitle}</strong> (Ref: <code>${data.bookingRef}</code>) has been cancelled. Below are your cancellation and refund details:</p>
    
    <div style="background-color: #fef2f2; border: 1px solid #fee2e2; border-radius: 12px; padding: 20px; margin: 20px 0;">
      <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #374151;">
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Booking Ref:</td>
          <td style="padding: 8px 0; text-align: right; font-weight: 700; font-family: monospace; color: #991b1b;">${data.bookingRef}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Event / Workshop:</td>
          <td style="padding: 8px 0; text-align: right; font-weight: 700; color: #111827;">${data.eventTitle}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Seats Cancelled:</td>
          <td style="padding: 8px 0; text-align: right; font-weight: 700;">${data.seatCount} Seat(s)</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Total Amount Paid:</td>
          <td style="padding: 8px 0; text-align: right; font-weight: 700;">₹${Number(data.totalAmount).toFixed(2)} INR</td>
        </tr>
        ${data.cancellationReason ? `
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Cancellation Reason:</td>
          <td style="padding: 8px 0; text-align: right; font-weight: 600;">${data.cancellationReason}</td>
        </tr>` : ''}
        <tr style="border-top: 1px solid #fee2e2;">
          <td style="padding: 12px 0 0 0; color: #991b1b; font-weight: 800; font-size: 16px;">Eligible Refund:</td>
          <td style="padding: 12px 0 0 0; text-align: right; font-weight: 800; font-size: 16px; color: #991b1b;">₹${Number(data.refundAmount).toFixed(2)} INR (${data.refundPercentage}%)</td>
        </tr>
      </table>
    </div>

    <p style="font-size: 13px; color: #6b7280; line-height: 1.5;">
      ${data.refundAmount > 0
        ? 'Your refund request has been queued and will be processed back to your original payment method upon standard processing verification.'
        : 'Based on our refund policy timeline for this event, 0% refund applies to this cancellation.'}
    </p>
  </div>
  <div style="border-top: 1px solid #f3f4f6; padding-top: 16px; text-align: center; font-size: 12px; color: #9ca3af;">
    BookMyTraining Platform &bull; Live Workshops & Skill Training
  </div>
</div>`.trim();
}
