"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTicketWhatsAppTemplate = generateTicketWhatsAppTemplate;
exports.generateTicketInAppTemplate = generateTicketInAppTemplate;
function generateTicketWhatsAppTemplate(data) {
    return `🎉 *BOOKING CONFIRMED & TICKET DELIVERED!*

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
}
function generateTicketInAppTemplate(data) {
    return `Your ticket for "${data.eventTitle}" (${data.bookingRef}) is confirmed and ready!`;
}
