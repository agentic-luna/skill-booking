export interface ClientWhatsAppOtpTemplateData {
  otp: string;
  expiresInMinutes?: number;
}

export function generateClientWhatsAppOtpTemplate(data: ClientWhatsAppOtpTemplateData): string {
  const expiry = data.expiresInMinutes || 10;
  const text = `🔐 *BOOKMYTRAINING CLIENT VERIFICATION*

Your WhatsApp verification OTP code is:
*${data.otp}*

⏱️ Valid for *${expiry} minutes*. Please do not share this code with anyone for your account security.

Welcome to BookMyTraining! 🚀`.trim();

  return JSON.stringify({
    text,
    templateName: 'client_whatsapp_otp',
    parameters: [
      data.otp,
      String(expiry)
    ]
  });
}
