import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Migrating existing events...');

  const events = await prisma.event.findMany();

  for (const event of events) {
    let instructorId: string | null = null;
    let venueId: string | null = null;

    if (event.venueDetails) {
      let details: any = {};
      
      if (typeof event.venueDetails === 'string') {
        details = { address: event.venueDetails };
      } else if (typeof event.venueDetails === 'object') {
        details = event.venueDetails;
      }

      // Check/create Instructor
      if (details.instructorName) {
        const inst = await prisma.instructor.create({
          data: {
            name: details.instructorName,
            bio: details.instructorBio || '',
            photoUrl: details.instructorPhoto || '',
            companyName: details.companyName || '',
            facebook: details.facebook || null,
            instagram: details.instagram || null,
            linkedin: details.linkedin || null,
          },
        });
        instructorId = inst.id;
        console.log(`Created instructor ${details.instructorName} for event ${event.id}`);
      }

      // Check/create Venue
      const address = details.address || '';
      const meetingLink = details.meetingLink || null;
      if (address || meetingLink) {
        const venue = await prisma.venue.create({
          data: {
            address: address,
            meetingLink: meetingLink,
          },
        });
        venueId = venue.id;
        console.log(`Created venue for event ${event.id} (address: ${address})`);
      }
    }

    if (instructorId || venueId) {
      await prisma.event.update({
        where: { id: event.id },
        data: {
          instructorId,
          venueId,
        },
      });
      console.log(`Linked instructor and venue to event ${event.id}`);
    }
  }

  console.log('Migration complete!');
}

main()
  .catch((e) => {
    console.error('Error running migration script:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
