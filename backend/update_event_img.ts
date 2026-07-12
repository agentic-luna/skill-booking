import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const events = await prisma.event.findMany();
  console.log('Events found:', events.length);
  if (events.length > 0) {
    const event = events[0]; // Just grab the first one, or maybe there is only one.
    console.log('Updating event:', event.id, event.title);
    await prisma.event.update({
      where: { id: event.id },
      data: { posterUrl: '/nextpic.webp' }
    });
    console.log('Update complete.');
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
