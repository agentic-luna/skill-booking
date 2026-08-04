export interface EditRequestApprovedTemplateData {
  hostName: string;
  eventTitle: string;
  eventId: string;
}

export function generateEditRequestApprovedEmailTemplate(data: EditRequestApprovedTemplateData): string {
  return `
<div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px;">
  <div style="background: linear-gradient(135deg, #064e3b, #10b981); padding: 24px; border-radius: 12px; text-align: center; color: #ffffff;">
    <h2 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 0.5px;">EDIT REQUEST APPROVED</h2>
    <p style="margin: 6px 0 0 0; font-size: 13px; color: #a7f3d0;">BOOKMYTRAINING HOST NOTIFICATION</p>
  </div>
  <div style="padding: 24px 8px 12px 8px;">
    <p style="font-size: 16px; color: #111827; margin-top: 0;">Hi <strong>${data.hostName}</strong>,</p>
    <p style="font-size: 14px; color: #4b5563; line-height: 1.5;">Your request to edit the event <strong>${data.eventTitle}</strong> has been approved by the admin team!</p>
    <p style="font-size: 14px; color: #4b5563; line-height: 1.5;">Your event is now unlocked in <strong>Edit Mode</strong>. You can update your workshop details, trainer bio, venue, or schedule from your Host Dashboard.</p>
    <p style="font-size: 13px; color: #6b7280; line-height: 1.5; margin-top: 16px;">Note: Once you save your edits, the event will be resubmitted for admin review.</p>
  </div>
  <div style="border-top: 1px solid #f3f4f6; padding-top: 16px; text-align: center; font-size: 12px; color: #9ca3af;">
    BookMyTraining Platform &bull; Live Workshops & Skill Training
  </div>
</div>`.trim();
}
