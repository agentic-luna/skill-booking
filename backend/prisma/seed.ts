import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('[Seeder] Starting database seeding...');

  // 1. Seed Superadmin User
  const adminEmail = 'admin@luna.com';
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash('admin123', 10);
    await prisma.user.create({
      data: {
        firstName: 'Luna',
        lastName: 'Admin',
        email: adminEmail,
        phone: '+15550100',
        passwordHash,
        role: 'SUPERADMIN',
        status: 'ACTIVE',
      },
    });
    console.log('[Seeder] Superadmin user created successfully: admin@luna.com / password: admin123');
  } else {
    console.log('[Seeder] Superadmin user already exists.');
  }

  // 2. Seed Platform Settings
  const refundMatrixKey = 'refund_matrix';
  await prisma.platformSetting.upsert({
    where: { key: refundMatrixKey },
    update: {},
    create: {
      key: refundMatrixKey,
      value: [
        { hoursBefore: 48, refundPercentage: 100 },
        { hoursBefore: 24, refundPercentage: 50 },
        { hoursBefore: 0, refundPercentage: 0 },
      ],
    },
  });

  const brandingKey = 'ui_branding';
  await prisma.platformSetting.upsert({
    where: { key: brandingKey },
    update: {},
    create: {
      key: brandingKey,
      value: {
        theme: 'dark',
        primaryColor: '#6366f1',
        secondaryColor: '#14b8a6',
        logoUrl: 'https://example.com/assets/logo.png',
      },
    },
  });
  console.log('[Seeder] Platform settings seeded successfully.');

  // 3. Seed Default Message Templates
  const templates = [
    // BOOKING_CONFIRMED
    {
      channel: 'EMAIL',
      triggerEvent: 'BOOKING_CONFIRMED',
      subject: 'Booking Confirmed - {{eventTitle}}',
      bodyContent: 'Hi {{userName}},\n\nYour booking has been confirmed for {{eventTitle}}!\n\nBooking Ref: {{bookingRef}}\nSeats Booked: {{seatCount}}\nTotal Paid: {{totalAmount}} INR\n\nThanks,\nLuna Team',
      variables: ['userName', 'eventTitle', 'bookingRef', 'seatCount', 'totalAmount'],
      isActive: true,
    },
    {
      channel: 'SMS',
      triggerEvent: 'BOOKING_CONFIRMED',
      subject: null,
      bodyContent: 'Hi {{userName}}, your booking is confirmed for {{eventTitle}}. Ref: {{bookingRef}}. Seats: {{seatCount}}.',
      variables: ['userName', 'eventTitle', 'bookingRef', 'seatCount'],
      isActive: true,
    },
    {
      channel: 'WHATSAPP',
      triggerEvent: 'BOOKING_CONFIRMED',
      subject: null,
      bodyContent: 'Hi *{{userName}}*,\nYour booking is confirmed for *{{eventTitle}}*!\n\nRef: {{bookingRef}}\nSeats: {{seatCount}}\nTotal: {{totalAmount}} INR',
      variables: ['userName', 'eventTitle', 'bookingRef', 'seatCount', 'totalAmount'],
      isActive: true,
    },
    {
      channel: 'IN_APP',
      triggerEvent: 'BOOKING_CONFIRMED',
      subject: 'Booking Confirmed',
      bodyContent: 'Your booking for {{eventTitle}} (Ref: {{bookingRef}}) is confirmed.',
      variables: ['eventTitle', 'bookingRef'],
      isActive: true,
    },

    // EVENT_APPROVED
    {
      channel: 'EMAIL',
      triggerEvent: 'EVENT_APPROVED',
      subject: 'Your Skill-Training Event Has Been Approved!',
      bodyContent: 'Hi Trainer,\n\nWe are pleased to inform you that your event "{{eventTitle}}" has been approved and is now live for client bookings.\n\nBest regards,\nLuna Team',
      variables: ['eventTitle'],
      isActive: true,
    },
    {
      channel: 'IN_APP',
      triggerEvent: 'EVENT_APPROVED',
      subject: 'Event Approved',
      bodyContent: 'Your event "{{eventTitle}}" has been approved by the administrators.',
      variables: ['eventTitle'],
      isActive: true,
    },

    // KYC_REJECTED
    {
      channel: 'EMAIL',
      triggerEvent: 'KYC_REJECTED',
      subject: 'KYC Document Verification Update',
      bodyContent: 'Hi Host,\n\nYour profile verification document submission has been rejected. Please log in to resubmit valid government IDs.\n\nRegards,\nLuna Platform Team',
      variables: [],
      isActive: true,
    },
    {
      channel: 'IN_APP',
      triggerEvent: 'KYC_REJECTED',
      subject: 'KYC Rejected',
      bodyContent: 'Your KYC profile submission has been rejected. Please review the criteria and submit again.',
      variables: [],
      isActive: true,
    },
  ];

  for (const t of templates) {
    const existing = await prisma.messageTemplate.findFirst({
      where: {
        channel: t.channel as any,
        triggerEvent: t.triggerEvent as any,
      },
    });

    if (!existing) {
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
  }

  console.log('[Seeder] Message templates seeded successfully.');
  console.log('[Seeder] Database seeding complete.');
}

main()
  .catch((e) => {
    console.error('[Seeder] Error during database seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
