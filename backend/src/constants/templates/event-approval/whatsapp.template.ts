import { ApproveEventTemplateData } from './email.template';

export function generateApproveEventWhatsAppTemplate(data: ApproveEventTemplateData): string {
  return `🎉 *EVENT APPROVED & LIVE FOR BOOKINGS!*

Hi *${data.hostName}*, your event *${data.eventTitle}* has been approved and is now live on BookMyTraining! 🚀

📋 *Event Details:*
• *Event:* ${data.eventTitle}
• *Category:* ${data.category}
• *Schedule:* ${data.formattedStartTime}
• *Mode:* ${data.mode}
• *Ticket Price:* ₹${Number(data.price).toFixed(2)}
• *Total Seats:* ${data.totalSeats} Seats
• *Platform Commission:* ${data.commissionValue}${data.commissionType === 'PERCENTAGE' ? '%' : ' INR'}

Log in to your Host Dashboard to view live registrations and manage your event. Thank you for hosting on BookMyTraining!`.trim();
}

export function generateApproveEventInAppTemplate(data: ApproveEventTemplateData): string {
  return `Your event "${data.eventTitle}" has been approved and is now live for bookings!`;
}
