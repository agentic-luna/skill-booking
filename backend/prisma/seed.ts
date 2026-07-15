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

  const passwordHash = await bcrypt.hash('Admin@123', 10);

  if (!existingAdmin) {
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
    console.log('[Seeder] Superadmin user created successfully: admin@luna.com / password: Admin@123');
  } else {
    await prisma.user.update({
      where: { email: adminEmail },
      data: {
        passwordHash,
        role: 'SUPERADMIN',
        status: 'ACTIVE',
      },
    });
    console.log('[Seeder] Superadmin user updated/verified successfully: admin@luna.com / password: Admin@123');
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

  // 4. Seed Mock Host, Client, Event, Bookings, and Refund Requests for integration testing
  console.log('[Seeder] Seeding integration testing data (Host, Client, Event, Bookings, Refund Requests)...');

  // Host User
  const hostEmail = 'host@luna.com';
  let host = await prisma.user.findUnique({ where: { email: hostEmail } });
  if (!host) {
    const passwordHash = await bcrypt.hash('password123', 10);
    host = await prisma.user.create({
      data: {
        firstName: 'John',
        lastName: 'Doe',
        email: hostEmail,
        phone: '+15550202',
        passwordHash,
        role: 'HOST',
        status: 'ACTIVE',
      },
    });
  }

  // Host Profile
  let hostProfile = await prisma.hostProfile.findUnique({ where: { userId: host.id } });
  if (!hostProfile) {
    hostProfile = await prisma.hostProfile.create({
      data: {
        userId: host.id,
        bio: 'Certified senior React & NextJS instructor with 10+ years developer experience.',
        kycStatus: 'APPROVED',
        accountType: 'INDIVIDUAL',
      },
    });
  }

  // Client User
  const clientEmail = 'client@luna.com';
  let client = await prisma.user.findUnique({ where: { email: clientEmail } });
  if (!client) {
    const passwordHash = await bcrypt.hash('password123', 10);
    client = await prisma.user.create({
      data: {
        firstName: 'Jane',
        lastName: 'Smith',
        email: clientEmail,
        phone: '+15550201',
        passwordHash,
        role: 'CLIENT',
        status: 'ACTIVE',
      },
    });
  }

  // Client Profile
  let clientProfile = await prisma.clientProfile.findUnique({ where: { userId: client.id } });
  if (!clientProfile) {
    await prisma.clientProfile.create({
      data: {
        userId: client.id,
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
        bio: 'Enthusiastic developer learning fullstack programming.',
      },
    });
  }

  // Event (Workshop)
  const eventTitle = 'Advanced Next.js 15 & React 19 Sprint';
  let event = await prisma.event.findFirst({ where: { title: eventTitle } });
  if (!event) {
    const instructor1 = await prisma.instructor.create({
      data: {
        name: 'Athul Sabu',
        bio: 'Senior Software Engineer and Educator',
        photoUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR-adjKSmtOGut8RC90yikoWKlgYc0yDGawwBAOGwPz2A&s=10',
        companyName: 'TechAcademy',
        facebook: '',
        instagram: '',
        linkedin: '',
      },
    });

    const venue1 = await prisma.venue.create({
      data: {
        address: '',
        meetingLink: 'https://zoom.us/j/987654321',
      },
    });

    event = await prisma.event.create({
      data: {
        hostId: hostProfile.id,
        title: eventTitle,
        description: 'Deep dive into server actions, concurrent rendering, and app router architectural patterns.',
        posterUrl: 'https://images.unsplash.com/photo-1618401471353-b98aedd07871?auto=format&fit=crop&q=80&w=600',
        mode: 'ONLINE',
        startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        totalSeats: 20,
        availableSeats: 18,
        status: 'APPROVED',
        duration: '2 hours',
        durationHours: 2.0,
        venueDetails: { meetingLink: 'https://zoom.us/j/987654321' },
        instructorId: instructor1.id,
        venueId: venue1.id,
      },
    });

    // Create Event Commission
    await prisma.eventCommission.create({
      data: {
        eventId: event.id,
        commissionType: 'PERCENTAGE',
        platformValue: 15.00,
      },
    });
  }

  // Kerala Skills Mock Data
  const additionalEvents = [
    {
      title: 'Traditional Kerala Cooking Masterclass',
      description: 'Learn to cook authentic Kerala Sadya with secret family recipes.',
      posterUrl: 'https://images.unsplash.com/photo-1626509653294-1d11b332b49c?auto=format&fit=crop&q=80&w=600',
      mode: 'ONLINE',
      price: 50.00,
      category: 'cooking',
      duration: '3 hours',
      durationHours: 3.0,
    },
    {
      title: 'Kalaripayattu Basics - Martial Arts',
      description: 'An introductory workshop to the ancient martial art form of Kerala.',
      posterUrl: 'https://images.unsplash.com/photo-1599839619722-39751411ea63?auto=format&fit=crop&q=80&w=600',
      mode: 'OFFLINE',
      price: 75.00,
      category: 'fitness',
      duration: '4 hours',
      durationHours: 4.0,
    },
    {
      title: 'Malayalam Language for Beginners',
      description: 'Master the basics of Malayalam language for conversation and travel.',
      posterUrl: 'https://images.unsplash.com/photo-1510137600163-2729bc6959a6?auto=format&fit=crop&q=80&w=600',
      mode: 'ONLINE',
      price: 30.00,
      category: 'languages',
      duration: '2 hours',
      durationHours: 2.0,
    },
    {
      title: 'Kerala Mural Painting Techniques',
      description: 'Discover the vibrant world of traditional Kerala Mural arts and colors.',
      posterUrl: 'https://images.unsplash.com/photo-1582561424760-0321d6cb1d6b?auto=format&fit=crop&q=80&w=600',
      mode: 'OFFLINE',
      price: 60.00,
      category: 'arts',
      duration: '5 hours',
      durationHours: 5.0,
    }
  ];

  for (const evt of additionalEvents) {
    let existingEvt = await prisma.event.findFirst({ where: { title: evt.title } });
    if (!existingEvt) {
      const address = evt.mode === 'ONLINE' ? '' : 'Kochi, Kerala';
      const meetingLink = evt.mode === 'ONLINE' ? 'https://zoom.us/j/123456' : null;

      const inst = await prisma.instructor.create({
        data: {
          name: 'Athul Sabu',
          bio: 'dwef fwrjuqf hwqr',
          photoUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR-adjKSmtOGut8RC90yikoWKlgYc0yDGawwBAOGwPz2A&s=10',
          companyName: 'A',
          facebook: '',
          instagram: '',
          linkedin: '',
        },
      });

      const venue = await prisma.venue.create({
        data: {
          address,
          meetingLink,
        },
      });

      await prisma.event.create({
        data: {
          hostId: hostProfile.id,
          title: evt.title,
          description: evt.description,
          posterUrl: evt.posterUrl,
          mode: evt.mode as 'ONLINE' | 'OFFLINE',
          price: evt.price,
          category: evt.category,
          duration: evt.duration,
          durationHours: evt.durationHours,
          startTime: new Date(Date.now() + Math.random() * 14 * 24 * 60 * 60 * 1000), 
          totalSeats: 30,
          availableSeats: 25,
          status: 'APPROVED',
          venueDetails: evt.mode === 'ONLINE' ? { meetingLink: 'https://zoom.us/j/123456' } : { address: 'Kochi, Kerala' },
          instructorId: inst.id,
          venueId: venue.id,
        },
      });
    }
  }

  // Booking 1 - Standard Booking
  const booking1Ref = 'BMS-837492';
  let booking1 = await prisma.booking.findUnique({ where: { bookingRef: booking1Ref } });
  if (!booking1) {
    booking1 = await prisma.booking.create({
      data: {
        bookingRef: booking1Ref,
        clientId: client.id,
        eventId: event.id,
        seatCount: 1,
        totalAmount: 150.00,
        status: 'CONFIRMED',
      },
    });
  }

  // Refund Request 1 - Pending
  let refund1 = await prisma.refundRequest.findUnique({ where: { bookingId: booking1.id } });
  if (!refund1) {
    await prisma.refundRequest.create({
      data: {
        bookingId: booking1.id,
        reason: 'Class schedule conflict due to unexpected business travel.',
        status: 'PENDING',
      },
    });
  }

  // Booking 2 - Standard Booking
  const booking2Ref = 'BMS-910283';
  let booking2 = await prisma.booking.findUnique({ where: { bookingRef: booking2Ref } });
  if (!booking2) {
    booking2 = await prisma.booking.create({
      data: {
        bookingRef: booking2Ref,
        clientId: client.id,
        eventId: event.id,
        seatCount: 1,
        totalAmount: 75.00,
        status: 'CONFIRMED',
      },
    });
  }

  // Refund Request 2 - Pending
  let refund2 = await prisma.refundRequest.findUnique({ where: { bookingId: booking2.id } });
  if (!refund2) {
    await prisma.refundRequest.create({
      data: {
        bookingId: booking2.id,
        reason: 'Instructor rescheduled the timing twice, no longer convenient.',
        status: 'PENDING',
      },
    });
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
