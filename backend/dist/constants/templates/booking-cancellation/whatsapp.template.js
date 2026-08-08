"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCancelBookingWhatsAppTemplate = generateCancelBookingWhatsAppTemplate;
exports.generateCancelBookingInAppTemplate = generateCancelBookingInAppTemplate;
function generateCancelBookingWhatsAppTemplate(data) {
    const refundPolicyMsg = data.refundAmount > 0
        ? 'ℹ️ Your refund will be processed back to your original payment method upon standard processing verification.'
        : 'ℹ️ Based on the refund policy, 0% refund applies to this cancellation.';
    const reasonText = data.cancellationReason || 'N/A';
    const text = `❌ *BOOKING CANCELLED*

Hi *${data.userName}*, your booking for *${data.eventTitle}* has been cancelled.

📋 *Cancellation Summary:*
• *Booking Ref:* ${data.bookingRef}
• *Event:* ${data.eventTitle}
• *Seats Cancelled:* ${data.seatCount}
• *Total Paid:* ₹${Number(data.totalAmount).toFixed(2)}
• *Eligible Refund:* ₹${Number(data.refundAmount).toFixed(2)} (${data.refundPercentage}%)
${data.cancellationReason ? `• *Reason:* ${data.cancellationReason}\n` : ''}
${refundPolicyMsg}

Thank you for using BookMyTraining.`.trim();
    return JSON.stringify({
        text,
        templateName: 'booking_cancellation',
        parameters: [
            data.userName,
            data.eventTitle,
            data.bookingRef,
            data.eventTitle,
            String(data.seatCount),
            Number(data.totalAmount).toFixed(2),
            Number(data.refundAmount).toFixed(2),
            String(data.refundPercentage),
            reasonText
        ]
    });
}
function generateCancelBookingInAppTemplate(data) {
    return `Your booking for "${data.eventTitle}" (${data.bookingRef}) has been cancelled. Eligible refund: ₹${Number(data.refundAmount).toFixed(2)}.`;
}
