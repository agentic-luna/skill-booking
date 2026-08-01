"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingCleanupJob = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const client_1 = require("@prisma/client");
const prisma_1 = require("../../config/prisma");
const di_container_1 = require("../../api/di-container");
class BookingCleanupJob {
    /**
     * Starts the background cron job to cancel unconfirmed bookings
     * whose payment has not been confirmed after 10 minutes, and
     * releases reserved seats back to the event inventory.
     *
     * Runs every minute: '* * * * *'
     */
    static startUnconfirmedBookingCleaner() {
        node_cron_1.default.schedule('* * * * *', async () => {
            try {
                const TEN_MINUTES_MS = 10 * 60 * 1000;
                const cutoffTime = new Date(Date.now() - TEN_MINUTES_MS);
                // Find all INITIATED bookings created more than 10 minutes ago
                const expiredBookings = await prisma_1.prisma.booking.findMany({
                    where: {
                        status: client_1.BookingStatus.INITIATED,
                        createdAt: {
                            lte: cutoffTime,
                        },
                    },
                    select: {
                        id: true,
                        eventId: true,
                        seatCount: true,
                        bookingRef: true,
                    },
                });
                if (expiredBookings.length === 0) {
                    return;
                }
                di_container_1.logger.info(`[BookingCleanupCron] Found ${expiredBookings.length} unconfirmed booking(s) older than 10 minutes. Processing cancellation...`);
                let canceledCount = 0;
                for (const booking of expiredBookings) {
                    try {
                        await prisma_1.prisma.$transaction(async (tx) => {
                            // 1. Mark booking as CANCELED (concurrency guard: ensure status is still INITIATED)
                            const updated = await tx.booking.updateMany({
                                where: {
                                    id: booking.id,
                                    status: client_1.BookingStatus.INITIATED,
                                },
                                data: {
                                    status: client_1.BookingStatus.CANCELED,
                                },
                            });
                            // 2. If status was updated to CANCELED, release reserved seats back to event
                            if (updated.count > 0) {
                                await tx.event.update({
                                    where: { id: booking.eventId },
                                    data: {
                                        availableSeats: {
                                            increment: booking.seatCount,
                                        },
                                        version: {
                                            increment: 1,
                                        },
                                    },
                                });
                                canceledCount++;
                                di_container_1.logger.info(`[BookingCleanupCron] Canceled expired booking ${booking.bookingRef} (${booking.id}) and released ${booking.seatCount} seat(s) back to event ${booking.eventId}.`);
                            }
                        });
                    }
                    catch (err) {
                        di_container_1.logger.error(`[BookingCleanupCron] Failed to cancel expired booking ${booking.id}:`, err);
                    }
                }
                // Invalidate event search cache if any seats were released
                if (canceledCount > 0) {
                    await di_container_1.cacheService.delPattern('events:search:*');
                }
            }
            catch (error) {
                di_container_1.logger.error('[BookingCleanupCron] Error running unconfirmed booking cleanup:', error);
            }
        });
    }
}
exports.BookingCleanupJob = BookingCleanupJob;
