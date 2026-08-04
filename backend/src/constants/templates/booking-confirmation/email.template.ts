export interface TicketTemplateData {
  userName: string;
  bookingRef: string;
  bookingId: string;
  eventTitle: string;
  formattedDate: string;
  formattedTime: string;
  seatCount: number;
  totalAmount: number;
  trainerName: string;
  venueInfo: string;
  verifyUrl: string;
  ticketDownloadUrl: string;
  ticketSvgDataUrl?: string;
}

export function generateTicketEmailTemplate(data: TicketTemplateData): string {
  const ticketImageHtml = data.ticketSvgDataUrl
    ? `
    <div style="text-align: center; margin: 20px 0;">
      <img src="${data.ticketSvgDataUrl}" alt="Admission Ticket Image" style="width: 100%; max-width: 380px; height: auto; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.15);" />
    </div>`
    : '';

  return `
<div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px;">
  <div style="background: linear-gradient(135deg, #064e3b, #10b981); padding: 24px; border-radius: 12px; text-align: center; color: #ffffff;">
    <h2 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 0.5px;">BOOKMYTRAINING TICKET</h2>
    <p style="margin: 6px 0 0 0; font-size: 13px; color: #a7f3d0;">BOOKING CONFIRMED & TICKET ISSUED</p>
  </div>
  <div style="padding: 24px 8px 12px 8px;">
    <p style="font-size: 16px; color: #111827; margin-top: 0;">Hi <strong>${data.userName}</strong>,</p>
    <p style="font-size: 14px; color: #4b5563; line-height: 1.5;">Your booking for <strong>${data.eventTitle}</strong> is confirmed. Below is your official ticket image and admission details:</p>
    ${ticketImageHtml}
    <div style="background-color: #f9fafb; border: 1px solid #f3f4f6; border-radius: 12px; padding: 20px; margin: 20px 0;">
      <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #374151;">
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Booking Ref:</td>
          <td style="padding: 8px 0; text-align: right; font-weight: 700; font-family: monospace; color: #047857;">${data.bookingRef}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Event / Workshop:</td>
          <td style="padding: 8px 0; text-align: right; font-weight: 700; color: #111827;">${data.eventTitle}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Date & Time:</td>
          <td style="padding: 8px 0; text-align: right; font-weight: 600;">${data.formattedDate} at ${data.formattedTime}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Seats Allocated:</td>
          <td style="padding: 8px 0; text-align: right; font-weight: 700;">${data.seatCount} Seat(s)</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Trainer / Host:</td>
          <td style="padding: 8px 0; text-align: right; font-weight: 600;">${data.trainerName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Venue / Mode:</td>
          <td style="padding: 8px 0; text-align: right; font-weight: 600;">${data.venueInfo}</td>
        </tr>
        <tr style="border-top: 1px solid #e5e7eb;">
          <td style="padding: 12px 0 0 0; color: #064e3b; font-weight: 800; font-size: 16px;">Total Paid:</td>
          <td style="padding: 12px 0 0 0; text-align: right; font-weight: 800; font-size: 16px; color: #064e3b;">₹${Number(data.totalAmount).toFixed(2)} INR</td>
        </tr>
      </table>
    </div>
    <div style="text-align: center; margin: 28px 0 16px 0;">
      <a href="${data.verifyUrl}" style="background-color: #064e3b; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block;">View & Verify Official Ticket</a>
    </div>
  </div>
  <div style="border-top: 1px solid #f3f4f6; padding-top: 16px; text-align: center; font-size: 12px; color: #9ca3af;">
    BookMyTraining Platform &bull; Live Workshops & Skill Training
  </div>
</div>`.trim();
}
