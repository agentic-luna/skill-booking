import cron from 'node-cron';
import { prisma } from '../../config/prisma';
// Import your logger and cache service if you have them globally accessible
// import { logger } from '../../api/di-container'; 

export class EventJobs {
  static startStatusUpdater() {
    // This cron expression '0 * * * *' means it runs at minute 0 of every hour.
    // E.g., 1:00, 2:00, 3:00, etc.
    cron.schedule('0 * * * *', async () => {
      try {
        console.log('[Cron] Starting event status cleanup job...');
        const now = new Date();

        // 1. Find and update all APPROVED events that are in the past
        const result = await prisma.event.updateMany({
          where: {
            status: 'APPROVED',
            startTime: { lt: now }, 
          },
          data: {
            status: 'COMPLETED',
          },
        });

        if (result.count > 0) {
          console.log(`[Cron] Successfully marked ${result.count} past events as COMPLETED.`);
        } else {
          console.log('[Cron] No past events found to update.');
        }

        // 2. Mark past boosted events as EXPIRED
        const expiredBoosts = await prisma.boostedEvent.updateMany({
          where: {
            status: { in: ['ACTIVE', 'APPROVED', 'PENDING'] },
            endDate: { lt: now }
          },
          data: {
            status: 'EXPIRED',
            isActive: false
          }
        });
        if (expiredBoosts.count > 0) {
          console.log(`[Cron] Marked ${expiredBoosts.count} expired boosted events as EXPIRED.`);
        }

        // 3. Mark current scheduled boosted events as ACTIVE
        const activatedBoosts = await prisma.boostedEvent.updateMany({
          where: {
            status: 'APPROVED',
            startDate: { lte: now },
            endDate: { gte: now }
          },
          data: {
            status: 'ACTIVE',
            isActive: true
          }
        });
        if (activatedBoosts.count > 0) {
          console.log(`[Cron] Activated ${activatedBoosts.count} boosted events whose campaign start time arrived.`);
        }
      } catch (error) {
        console.error('[Cron] Error updating event and boost statuses:', error);
      }
    });
  }
}