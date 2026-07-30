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
          
          // 2. Invalidate your cache here so the frontend updates immediately!
          // Example: await cacheService.deletePattern('events:search:*');
        } else {
          console.log('[Cron] No past events found to update.');
        }
      } catch (error) {
        console.error('[Cron] Error updating event statuses:', error);
      }
    });
  }
}