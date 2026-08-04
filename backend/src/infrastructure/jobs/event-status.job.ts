import cron from 'node-cron';
import { prisma } from '../../config/prisma';
import { cacheService, logger } from '../../api/di-container';

export class EventJobs {
  static startStatusUpdater() {
    // Runs at minute 0 of every hour
    cron.schedule('0 * * * *', async () => {
      // Distributed Lock: Only 1 container replica executes the cron tick
      const hasLock = await cacheService.acquireLock('lock:cron:event-status-updater', 300);
      if (!hasLock) return;

      try {
        logger.info('[EventCron] Starting event status cleanup job...');
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
          logger.info(`[EventCron] Marked ${result.count} past events as COMPLETED.`);
        }

        // 2. Mark past boosted events as EXPIRED
        const expiredBoosts = await prisma.boostedEvent.updateMany({
          where: {
            status: { in: ['ACTIVE', 'APPROVED', 'PENDING'] },
            endDate: { lt: now },
          },
          data: {
            status: 'EXPIRED',
            isActive: false,
          },
        });
        if (expiredBoosts.count > 0) {
          logger.info(`[EventCron] Marked ${expiredBoosts.count} expired boosted events as EXPIRED.`);
        }

        // 3. Mark current scheduled boosted events as ACTIVE
        const activatedBoosts = await prisma.boostedEvent.updateMany({
          where: {
            status: 'APPROVED',
            startDate: { lte: now },
            endDate: { gte: now },
          },
          data: {
            status: 'ACTIVE',
            isActive: true,
          },
        });
        if (activatedBoosts.count > 0) {
          logger.info(`[EventCron] Activated ${activatedBoosts.count} boosted events whose campaign start time arrived.`);
        }
      } catch (error) {
        logger.error('[EventCron] Error updating event and boost statuses:', error);
      }
    });
  }       
}