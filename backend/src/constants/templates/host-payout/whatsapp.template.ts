import { HostPayoutTemplateData } from './email.template';

export function generateHostPayoutWhatsAppTemplate(data: HostPayoutTemplateData): string {
  const eventTitle = data.eventTitle || 'Workshop Session';

  const text = `💸 *HOST PAYOUT RELEASED!*

Hi *${data.hostName}*, your payout of *₹${Number(data.amount).toFixed(2)}* has been transferred to your registered bank account (${data.bankName}).

📋 *Payout Summary:*
• *Payout ID:* ${data.payoutId}
• *Amount:* ₹${Number(data.amount).toFixed(2)}
• *Transactions Settled:* ${data.transactionsPaid}

Thank you for being a valued Host on BookMyTraining! 🚀`.trim();

  return JSON.stringify({
    text,
    templateName: 'host_payout_released',
    parameters: [
      data.hostName,
      eventTitle,
      Number(data.amount).toFixed(2)
    ]
  });
}

export function generateHostPayoutInAppTemplate(data: HostPayoutTemplateData): string {
  return `Payout of ₹${Number(data.amount).toFixed(2)} has been released to your ${data.bankName} account (Ref: ${data.payoutId}).`;
}
