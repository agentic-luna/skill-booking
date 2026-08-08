export interface HostPayoutTemplateData {
  hostName: string;
  amount: number;
  payoutId: string;
  transactionsPaid: number;
  bankName: string;
  eventTitle?: string;
}

export function generateHostPayoutEmailTemplate(data: HostPayoutTemplateData): string {
  return `
<div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px;">
  <div style="background: linear-gradient(135deg, #064e3b, #10b981); padding: 24px; border-radius: 12px; text-align: center; color: #ffffff;">
    <h2 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 0.5px;">HOST PAYOUT RELEASED</h2>
    <p style="margin: 6px 0 0 0; font-size: 13px; color: #a7f3d0;">BOOKMYTRAINING PAYOUT CONFIRMATION</p>
  </div>
  <div style="padding: 24px 8px 12px 8px;">
    <p style="font-size: 16px; color: #111827; margin-top: 0;">Hi <strong>${data.hostName}</strong>,</p>
    <p style="font-size: 14px; color: #4b5563; line-height: 1.5;">Great news! Your escrow payout for completed training sessions has been successfully processed and released to your registered bank account.</p>

    <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; margin: 20px 0;">
      <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #374151;">
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Payout Reference ID:</td>
          <td style="padding: 8px 0; text-align: right; font-weight: 700; font-family: monospace; color: #047857;">${data.payoutId}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Workshops / Sessions Paid:</td>
          <td style="padding: 8px 0; text-align: right; font-weight: 600;">${data.transactionsPaid} Transaction(s)</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Destination Bank:</td>
          <td style="padding: 8px 0; text-align: right; font-weight: 600;">${data.bankName}</td>
        </tr>
        <tr style="border-top: 1px solid #bbf7d0;">
          <td style="padding: 12px 0 0 0; color: #064e3b; font-weight: 800; font-size: 16px;">Net Payout Amount:</td>
          <td style="padding: 12px 0 0 0; text-align: right; font-weight: 800; font-size: 16px; color: #064e3b;">₹${Number(data.amount).toFixed(2)} INR</td>
        </tr>
      </table>
    </div>

    <p style="font-size: 13px; color: #6b7280; line-height: 1.5;">Funds typically reflect in your account within standard banking transfer timelines.</p>
  </div>
  <div style="border-top: 1px solid #f3f4f6; padding-top: 16px; text-align: center; font-size: 12px; color: #9ca3af;">
    BookMyTraining Platform &bull; Host Finance Department
  </div>
</div>`.trim();
}
