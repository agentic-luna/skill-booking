export interface ClientMagicLinkTemplateData {
  userName?: string;
  magicLink: string;
  expiresInMinutes?: number;
}

export function generateClientMagicLinkTemplate(data: ClientMagicLinkTemplateData): string {
  const expiry = data.expiresInMinutes || 15;
  const greeting = data.userName ? `Hi <strong>${data.userName}</strong>,` : 'Hi there,';

  return `
<div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px;">
  <div style="background: linear-gradient(135deg, #064e3b, #10b981); padding: 24px; border-radius: 12px; text-align: center; color: #ffffff;">
    <h2 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 0.5px;">VERIFY YOUR EMAIL</h2>
    <p style="margin: 6px 0 0 0; font-size: 13px; color: #a7f3d0;">BOOKMYTRAINING CLIENT PORTAL</p>
  </div>
  <div style="padding: 24px 8px 12px 8px;">
    <p style="font-size: 15px; color: #374151; margin-top: 0;">${greeting}</p>
    <p style="font-size: 14px; color: #4b5563; line-height: 1.5;">Click the button below to verify your email address and link it to your BookMyTraining account:</p>
    
    <div style="text-align: center; margin: 28px 0;">
      <a href="${data.magicLink}" style="background-color: #064e3b; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: bold; font-size: 15px; display: inline-block; box-shadow: 0 4px 12px rgba(6, 78, 59, 0.25);">Verify Email Address</a>
    </div>

    <p style="font-size: 12px; color: #6b7280; line-height: 1.5;">Or copy and paste this link into your web browser:<br/><a href="${data.magicLink}" style="color: #064e3b; word-break: break-all;">${data.magicLink}</a></p>
    <p style="font-size: 12px; color: #9ca3af; margin-top: 20px;">This link will expire in <strong>${expiry} minutes</strong>.</p>
  </div>
  <div style="border-top: 1px solid #f3f4f6; padding-top: 16px; text-align: center; font-size: 12px; color: #9ca3af;">
    BookMyTraining Platform &bull; Live Workshops & Skill Training
  </div>
</div>`.trim();
}
