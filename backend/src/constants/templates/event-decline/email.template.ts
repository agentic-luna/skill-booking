export interface EventDeclineTemplateData {
  hostName: string;
  eventTitle: string;
  reason?: string;
}

export function generateEventDeclineEmailTemplate(data: EventDeclineTemplateData): string {
  return `
<div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px;">
  <div style="background: linear-gradient(135deg, #991b1b, #ef4444); padding: 24px; border-radius: 12px; text-align: center; color: #ffffff;">
    <h2 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 0.5px;">EVENT SUBMISSION UPDATE</h2>
    <p style="margin: 6px 0 0 0; font-size: 13px; color: #fca5a5;">BOOKMYTRAINING MODERATION</p>
  </div>
  <div style="padding: 24px 8px 12px 8px;">
    <p style="font-size: 16px; color: #111827; margin-top: 0;">Hi <strong>${data.hostName}</strong>,</p>
    <p style="font-size: 14px; color: #4b5563; line-height: 1.5;">Thank you for submitting your event <strong>${data.eventTitle}</strong> for review. Our moderation team has reviewed your submission, and unfortunately it could not be approved for listing at this time.</p>
    
    <div style="background-color: #fef2f2; border: 1px solid #fee2e2; border-radius: 12px; padding: 16px; margin: 20px 0;">
      <p style="font-size: 14px; color: #991b1b; margin: 0; font-weight: 600;">Moderation Note / Reason:</p>
      <p style="font-size: 14px; color: #7f1d1d; margin: 6px 0 0 0;">${data.reason || 'Event details did not meet platform guidelines.'}</p>
    </div>

    <p style="font-size: 13px; color: #6b7280; line-height: 1.5;">You can revise your event details or create a new workshop submission from your Host Dashboard.</p>
  </div>
  <div style="border-top: 1px solid #f3f4f6; padding-top: 16px; text-align: center; font-size: 12px; color: #9ca3af;">
    BookMyTraining Platform &bull; Event Moderation Team
  </div>
</div>`.trim();
}
