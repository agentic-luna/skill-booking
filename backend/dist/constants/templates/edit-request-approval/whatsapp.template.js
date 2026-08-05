"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateEditRequestApprovedWhatsAppTemplate = generateEditRequestApprovedWhatsAppTemplate;
exports.generateEditRequestApprovedInAppTemplate = generateEditRequestApprovedInAppTemplate;
function generateEditRequestApprovedWhatsAppTemplate(data) {
    return `🎉 *EDIT REQUEST APPROVED!*

Hi *${data.hostName}*, your request to edit the event *${data.eventTitle}* has been approved! 🔓

Your event is now unlocked in Edit Mode. Please log in to your Host Dashboard to update your event details.

Thank you for hosting on BookMyTraining! 🚀`.trim();
}
function generateEditRequestApprovedInAppTemplate(data) {
    return `Your request to edit "${data.eventTitle}" has been approved. The event is now unlocked for editing.`;
}
