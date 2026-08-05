"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCancelBookingWhatsAppTemplate = generateCancelBookingWhatsAppTemplate;
exports.generateCancelBookingInAppTemplate = generateCancelBookingInAppTemplate;
function generateCancelBookingWhatsAppTemplate(data) {
    return `❌ *BOOKING CANCELLED*

Hi *${data.userName}*, your booking for *${data.eventTitle}* has been cancelled.

📋 *Cancellation Summary:*
• *Booking Ref:* ${data.bookingRef}
• *Event:* ${data.eventTitle}
• *Seats Cancelled:* ${data.seatCount}
• *Total Paid:* ₹${Number(data.totalAmount).toFixed(2)}
• *Eligible Refund:* ₹${Number(data.refundAmount).toFixed(2)} (${data.refundPercentage}%)
${data.cancellationReason ? `• *Reason:* ${data.cancellationReason}\n` : ''}
${data.refundAmount > 0 ? 'ℹ️ Your refund will be processed back to your original payment method upon standard processing verification.' : 'ℹ️ Based on the refund policy, 0% refund applies to this cancellation.'}

Thank you for using BookMyTraining.`.trim();
}
function generateCancelBookingInAppTemplate(data) {
    return `Your booking for "${data.eventTitle}" (${data.bookingRef}) has been cancelled. Eligible refund: ₹${Number(data.refundAmount).toFixed(2)}.`;
}
