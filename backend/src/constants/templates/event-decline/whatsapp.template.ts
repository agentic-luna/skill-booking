import { EventDeclineTemplateData } from './email.template';

export function generateEventDeclineWhatsAppTemplate(data: EventDeclineTemplateData): string {
  const reasonText = data.reason || 'Event details did not meet platform guidelines.';
  const text = `⚠️ *EVENT SUBMISSION DECLINED*

Hi *${data.hostName}*, your event submission *${data.eventTitle}* could not be approved for listing.

Reason: ${reasonText}

Log into your Host Dashboard to update your event details or create a new submission. Thank you!`.trim();

  return JSON.stringify({
    text,
    templateName: 'event_decline',
    parameters: [
      data.hostName,
      data.eventTitle,
      reasonText
    ]
  });
}

export function generateEventDeclineInAppTemplate(data: EventDeclineTemplateData): string {
  return `Your event submission "${data.eventTitle}" was declined by moderation.`;
}
