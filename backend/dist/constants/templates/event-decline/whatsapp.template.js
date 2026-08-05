"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateEventDeclineWhatsAppTemplate = generateEventDeclineWhatsAppTemplate;
exports.generateEventDeclineInAppTemplate = generateEventDeclineInAppTemplate;
function generateEventDeclineWhatsAppTemplate(data) {
    return `⚠️ *EVENT SUBMISSION DECLINED*

Hi *${data.hostName}*, your event submission *${data.eventTitle}* could not be approved for listing.

Reason: ${data.reason || 'Event details did not meet platform guidelines.'}

Log into your Host Dashboard to update your event details or create a new submission. Thank you!`.trim();
}
function generateEventDeclineInAppTemplate(data) {
    return `Your event submission "${data.eventTitle}" was declined by moderation.`;
}
