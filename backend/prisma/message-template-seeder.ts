import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('[MessageTemplateSeeder] Starting message templates seeding...');

  console.log('[MessageTemplateSeeder] Syncing message templates...');
  await prisma.messageTemplate.deleteMany();

  const templates = [
    // EMAIL_OTP
    {
      channel: 'EMAIL',
      triggerEvent: 'EMAIL_OTP',
      subject: 'Your Verification Code',
      bodyContent: '<div style="font-family: sans-serif; padding: 20px;"><p>Hi there,</p><p>Your verification code is: <strong>{{otp}}</strong></p><p>This code is valid for 10 minutes.</p></div>',
      variables: ['otp'],
      isActive: true,
    },
    // SMS_OTP
    {
      channel: 'SMS',
      triggerEvent: 'SMS_OTP',
      subject: null,
      bodyContent: 'Your registration code is: {{otp}}. Valid for 10 minutes.',
      variables: ['otp'],
      isActive: true,
    },
    // WHATSAPP_OTP
    {
      channel: 'WHATSAPP',
      triggerEvent: 'WHATSAPP_OTP',
      subject: null,
      bodyContent: 'Your WhatsApp OTP code is: {{otp}}. Valid for 10 minutes.',
      variables: ['otp'],
      isActive: true,
    },
    // PASSWORD_RESET (EMAIL)
    {
      channel: 'EMAIL',
      triggerEvent: 'PASSWORD_RESET',
      subject: 'Reset Your Password',
      bodyContent: '<div style="font-family: sans-serif; padding: 20px;"><p>Hello,</p><p>We received a request to reset your password. Use the code below:</p><h2>{{otp}}</h2><p>If you did not request this, please ignore this email.</p></div>',
      variables: ['otp'],
      isActive: true,
    },
    // PASSWORD_RESET (WHATSAPP)
    {
      channel: 'WHATSAPP',
      triggerEvent: 'PASSWORD_RESET',
      subject: null,
      bodyContent: 'Hello, your password reset code is: {{otp}}. If you did not request this, please ignore.',
      variables: ['otp'],
      isActive: true,
    },
    // BOOKING_CONFIRMED (EMAIL)
    {
      channel: 'EMAIL',
      triggerEvent: 'BOOKING_CONFIRMED',
      subject: 'Booking Confirmed - {{eventTitle}}',
      bodyContent: '<div style="font-family: sans-serif; padding: 20px;"><h2>Booking Confirmed!</h2><p>Hi {{userName}},</p><p>Your booking for <strong>{{eventTitle}}</strong> has been confirmed.</p><p>Reference: {{bookingRef}}<br>Seats: {{seatCount}}<br>Total Paid: {{totalAmount}} INR</p></div>',
      variables: ['userName', 'eventTitle', 'bookingRef', 'seatCount', 'totalAmount'],
      isActive: true,
    },
    // BOOKING_CONFIRMED (WHATSAPP)
    {
      channel: 'WHATSAPP',
      triggerEvent: 'BOOKING_CONFIRMED',
      subject: null,
      bodyContent: 'Hi {{userName}}, your booking for {{eventTitle}} is confirmed. Ref: {{bookingRef}}. Seats: {{seatCount}}. Total: {{totalAmount}} INR.',
      variables: ['userName', 'eventTitle', 'bookingRef', 'seatCount', 'totalAmount'],
      isActive: true,
    },
    // BOOKING_REMINDER (EMAIL)
    {
      channel: 'EMAIL',
      triggerEvent: 'BOOKING_REMINDER',
      subject: 'Reminder: {{eventTitle}} is starting soon!',
      bodyContent: '<div style="font-family: sans-serif; padding: 20px;"><h2>Event Reminder</h2><p>Hi {{userName}},</p><p>This is a reminder that the event <strong>{{eventTitle}}</strong> is starting at {{startTime}}.</p><p>We look forward to seeing you!</p></div>',
      variables: ['userName', 'eventTitle', 'startTime'],
      isActive: true,
    },
    // BOOKING_REMINDER (WHATSAPP)
    {
      channel: 'WHATSAPP',
      triggerEvent: 'BOOKING_REMINDER',
      subject: null,
      bodyContent: 'Hi {{userName}}, this is a reminder that {{eventTitle}} is starting at {{startTime}}. See you soon!',
      variables: ['userName', 'eventTitle', 'startTime'],
      isActive: true,
    },
    // BOOKING_CANCELLED (EMAIL)
    {
      channel: 'EMAIL',
      triggerEvent: 'BOOKING_CANCELLED',
      subject: 'Booking Cancelled - {{eventTitle}}',
      bodyContent: '<div style="font-family: sans-serif; padding: 20px;"><h2>Booking Cancelled</h2><p>Hi {{userName}},</p><p>Your booking for <strong>{{eventTitle}}</strong> has been cancelled.</p><p>Reference: {{bookingRef}}.</p><p>If you are eligible, your refund will be processed shortly.</p></div>',
      variables: ['userName', 'eventTitle', 'bookingRef'],
      isActive: true,
    },
    // BOOKING_CANCELLED (WHATSAPP)
    {
      channel: 'WHATSAPP',
      triggerEvent: 'BOOKING_CANCELLED',
      subject: null,
      bodyContent: 'Hi {{userName}}, your booking for {{eventTitle}} has been cancelled. Ref: {{bookingRef}}. Refund will be processed if eligible.',
      variables: ['userName', 'eventTitle', 'bookingRef'],
      isActive: true,
    },
    // PAYMENT_SUCCESS (EMAIL)
    {
      channel: 'EMAIL',
      triggerEvent: 'PAYMENT_SUCCESS',
      subject: 'Payment Receipt for {{bookingRef}}',
      bodyContent: '<div style="font-family: sans-serif; padding: 20px;"><h2>Payment Successful</h2><p>Hi {{userName}},</p><p>We have successfully received your payment of {{totalAmount}} INR for booking {{bookingRef}}.</p><p>Thank you!</p></div>',
      variables: ['userName', 'bookingRef', 'totalAmount'],
      isActive: true,
    },
    // PAYMENT_SUCCESS (WHATSAPP)
    {
      channel: 'WHATSAPP',
      triggerEvent: 'PAYMENT_SUCCESS',
      subject: null,
      bodyContent: 'Hi {{userName}}, payment of {{totalAmount}} INR for booking {{bookingRef}} was successful. Thank you!',
      variables: ['userName', 'bookingRef', 'totalAmount'],
      isActive: true,
    },
    // PAYMENT_FAILED (EMAIL)
    {
      channel: 'EMAIL',
      triggerEvent: 'PAYMENT_FAILED',
      subject: 'Payment Failed - {{bookingRef}}',
      bodyContent: '<div style="font-family: sans-serif; padding: 20px;"><h2>Payment Failed</h2><p>Hi {{userName}},</p><p>Your payment attempt of {{totalAmount}} INR for booking {{bookingRef}} has failed.</p><p>Please try again.</p></div>',
      variables: ['userName', 'bookingRef', 'totalAmount'],
      isActive: true,
    },
    // PAYMENT_FAILED (WHATSAPP)
    {
      channel: 'WHATSAPP',
      triggerEvent: 'PAYMENT_FAILED',
      subject: null,
      bodyContent: 'Hi {{userName}}, payment of {{totalAmount}} INR for booking {{bookingRef}} has failed. Please try again.',
      variables: ['userName', 'bookingRef', 'totalAmount'],
      isActive: true,
    },
    // REFUND_SUCCESS (EMAIL)
    {
      channel: 'EMAIL',
      triggerEvent: 'REFUND_SUCCESS',
      subject: 'Refund Processed for {{bookingRef}}',
      bodyContent: '<div style="font-family: sans-serif; padding: 20px;"><h2>Refund Successful</h2><p>Hi {{userName}},</p><p>A refund of {{refundAmount}} INR has been successfully processed for booking {{bookingRef}}.</p><p>It may take 5-7 business days to reflect in your account.</p></div>',
      variables: ['userName', 'bookingRef', 'refundAmount'],
      isActive: true,
    },
    // REFUND_SUCCESS (WHATSAPP)
    {
      channel: 'WHATSAPP',
      triggerEvent: 'REFUND_SUCCESS',
      subject: null,
      bodyContent: 'Hi {{userName}}, a refund of {{refundAmount}} INR has been processed for booking {{bookingRef}}. Thank you!',
      variables: ['userName', 'bookingRef', 'refundAmount'],
      isActive: true,
    },
    // TICKET_DELIVERY (EMAIL)
    {
      channel: 'EMAIL',
      triggerEvent: 'TICKET_DELIVERY',
      subject: 'Your Ticket for {{eventTitle}}',
      bodyContent: '<div style="font-family: sans-serif; padding: 20px;"><h2>Your Ticket</h2><p>Hi {{userName}},</p><p>Please find attached your ticket for <strong>{{eventTitle}}</strong>.</p><p>Show the attached PDF / ticket at the entrance.</p></div>',
      variables: ['userName', 'eventTitle'],
      isActive: true,
    },
    // TICKET_DELIVERY (WHATSAPP)
    {
      channel: 'WHATSAPP',
      triggerEvent: 'TICKET_DELIVERY',
      subject: null,
      bodyContent: 'Hi {{userName}}, please find attached your ticket for {{eventTitle}}. See you there!',
      variables: ['userName', 'eventTitle'],
      isActive: true,
    },
    // STAFF_INVITATION (EMAIL)
    {
      channel: 'EMAIL',
      triggerEvent: 'STAFF_INVITATION',
      subject: 'Invitation to Join Platform Staff',
      bodyContent: '<div style="font-family: sans-serif; padding: 20px;"><h2>Staff Invitation</h2><p>Hello,</p><p>You have been invited to join the platform as a staff member. Click the link below to accept the invitation:</p><p><a href="{{inviteLink}}">Accept Invitation</a></p></div>',
      variables: ['inviteLink'],
      isActive: true,
    },
  ];

  for (const t of templates) {
    await prisma.messageTemplate.create({
      data: {
        channel: t.channel as any,
        triggerEvent: t.triggerEvent as any,
        subject: t.subject,
        bodyContent: t.bodyContent,
        variables: t.variables,
        isActive: t.isActive,
      },
    });
  }

  console.log('[MessageTemplateSeeder] Message templates seeded successfully.');
}

main()
  .catch((e) => {
    console.error('[MessageTemplateSeeder] Error during database seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
