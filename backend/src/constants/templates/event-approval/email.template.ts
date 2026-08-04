export interface ApproveEventTemplateData {
  hostName: string;
  eventTitle: string;
  eventId: string;
  category: string;
  mode: string;
  price: number;
  totalSeats: number;
  commissionType: string;
  commissionValue: number;
  formattedStartTime: string;
}

export function generateApproveEventEmailTemplate(data: ApproveEventTemplateData): string {
  return `
<div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px;">
  <div style="background: linear-gradient(135deg, #064e3b, #10b981); padding: 24px; border-radius: 12px; text-align: center; color: #ffffff;">
    <h2 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 0.5px;">EVENT APPROVED & LIVE!</h2>
    <p style="margin: 6px 0 0 0; font-size: 13px; color: #a7f3d0;">BOOKMYTRAINING HOST NOTIFICATION</p>
  </div>
  <div style="padding: 24px 8px 12px 8px;">
    <p style="font-size: 16px; color: #111827; margin-top: 0;">Hi <strong>${data.hostName}</strong>,</p>
    <p style="font-size: 14px; color: #4b5563; line-height: 1.5;">Great news! Your event <strong>${data.eventTitle}</strong> has been reviewed and approved by our admin team. It is now live on BookMyTraining and open for attendee bookings!</p>

    <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; margin: 20px 0;">
      <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #374151;">
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Event Title:</td>
          <td style="padding: 8px 0; text-align: right; font-weight: 700; color: #111827;">${data.eventTitle}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Category:</td>
          <td style="padding: 8px 0; text-align: right; font-weight: 600;">${data.category}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Schedule:</td>
          <td style="padding: 8px 0; text-align: right; font-weight: 600;">${data.formattedStartTime}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Event Mode:</td>
          <td style="padding: 8px 0; text-align: right; font-weight: 600;">${data.mode}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Ticket Price:</td>
          <td style="padding: 8px 0; text-align: right; font-weight: 700; color: #047857;">₹${Number(data.price).toFixed(2)} INR</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Total Seats:</td>
          <td style="padding: 8px 0; text-align: right; font-weight: 700;">${data.totalSeats} Seats</td>
        </tr>
        <tr style="border-top: 1px solid #bbf7d0;">
          <td style="padding: 12px 0 0 0; color: #064e3b; font-weight: 800;">Platform Commission:</td>
          <td style="padding: 12px 0 0 0; text-align: right; font-weight: 800; color: #064e3b;">${data.commissionValue}${data.commissionType === 'PERCENTAGE' ? '%' : ' INR'}</td>
        </tr>
      </table>
    </div>

    <p style="font-size: 13px; color: #6b7280; line-height: 1.5;">You can track attendee registrations, manage your schedule, and monitor earnings directly from your Host Dashboard.</p>
  </div>
  <div style="border-top: 1px solid #f3f4f6; padding-top: 16px; text-align: center; font-size: 12px; color: #9ca3af;">
    BookMyTraining Platform &bull; Live Workshops & Skill Training
  </div>
</div>`.trim();
}
