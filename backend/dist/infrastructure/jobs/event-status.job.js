"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventJobs = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const prisma_1 = require("../../config/prisma");
// Import your logger and cache service if you have them globally accessible
// import { logger } from '../../api/di-container'; 
class EventJobs {
    static startStatusUpdater() {
        // This cron expression '0 * * * *' means it runs at minute 0 of every hour.
        // E.g., 1:00, 2:00, 3:00, etc.
        node_cron_1.default.schedule('0 * * * *', async () => {
            try {
                console.log('[Cron] Starting event status cleanup job...');
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
                    console.log(`[Cron] Successfully marked ${result.count} past events as COMPLETED.`);
                    // 2. Invalidate your cache here so the frontend updates immediately!
                    // Example: await cacheService.deletePattern('events:search:*');
                }
                else {
                    console.log('[Cron] No past events found to update.');
                }
            }
            catch (error) {
                console.error('[Cron] Error updating event statuses:', error);
            }
        });
    }
}
exports.EventJobs = EventJobs;
