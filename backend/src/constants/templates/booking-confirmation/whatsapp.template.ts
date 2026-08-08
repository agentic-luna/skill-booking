import { TicketTemplateData } from './email.template';

export function generateTicketWhatsAppTemplate(data: TicketTemplateData): string {
  const text = `🎉 *BOOKING CONFIRMED & TICKET DELIVERED!*

Hi *${data.userName}*, your ticket for *${data.eventTitle}* is ready.

🎫 *Ticket Summary:*
• *Booking Ref:* ${data.bookingRef}
• *Event:* ${data.eventTitle}
• *Date & Time:* ${data.formattedDate} at ${data.formattedTime}
• *Seats:* ${data.seatCount} Seat(s)
• *Total Paid:* ₹${Number(data.totalAmount).toFixed(2)}
• *Venue:* ${data.venueInfo}

🖼️ *View & Download Ticket Image:*
${data.ticketDownloadUrl}

🔗 *Verify & View Ticket Online:*
${data.verifyUrl}

Thank you for choosing BookMyTraining! 🚀`.trim();

  return JSON.stringify({
    text,
    templateName: 'booking_confirmation',
    headerImage: data.ticketDownloadUrl,
    parameters: [
      data.userName,
      data.eventTitle,
      data.bookingRef,
      data.eventTitle,
      `${data.formattedDate} at ${data.formattedTime}`,
      String(data.seatCount),
      Number(data.totalAmount).toFixed(2),
      data.venueInfo,
      data.verifyUrl
    ]
  });
}

export function generateTicketInAppTemplate(data: TicketTemplateData): string {
  return `Your ticket for "${data.eventTitle}" (${data.bookingRef}) is confirmed and ready!`;
}
