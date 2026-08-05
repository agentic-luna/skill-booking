"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventJobs = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const prisma_1 = require("../../config/prisma");
const di_container_1 = require("../../api/di-container");
class EventJobs {
    static startStatusUpdater() {
        // Runs at minute 0 of every hour
        node_cron_1.default.schedule('0 * * * *', async () => {
            // Distributed Lock: Only 1 container replica executes the cron tick
            const hasLock = await di_container_1.cacheService.acquireLock('lock:cron:event-status-updater', 300);
            if (!hasLock)
                return;
            try {
                di_container_1.logger.info('[EventCron] Starting event status cleanup job...');
                const now = new Date();
                // 1. Find and update all APPROVED events that are in the past
                const result = await prisma_1.prisma.event.updateMany({
                    where: {
                        status: 'APPROVED',
                        startTime: { lt: now },
                    },
                    data: {
                        status: 'COMPLETED',
                    },
                });
                if (result.count > 0) {
                    di_container_1.logger.info(`[EventCron] Marked ${result.count} past events as COMPLETED.`);
                }
                // 2. Mark past boosted events as EXPIRED
                const expiredBoosts = await prisma_1.prisma.boostedEvent.updateMany({
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
                    di_container_1.logger.info(`[EventCron] Marked ${expiredBoosts.count} expired boosted events as EXPIRED.`);
                }
                // 3. Mark current scheduled boosted events as ACTIVE
                const activatedBoosts = await prisma_1.prisma.boostedEvent.updateMany({
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
                    di_container_1.logger.info(`[EventCron] Activated ${activatedBoosts.count} boosted events whose campaign start time arrived.`);
                }
            }
            catch (error) {
                di_container_1.logger.error('[EventCron] Error updating event and boost statuses:', error);
            }
        });
    }
}
exports.EventJobs = EventJobs;
