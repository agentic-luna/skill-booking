import cron from 'node-cron';
import { BookingStatus } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { logger, cacheService } from '../../api/di-container';

export class BookingCleanupJob {
  /**
   * Starts the background cron job to cancel unconfirmed bookings
   * whose payment has not been confirmed after 10 minutes, and
   * releases reserved seats back to the event inventory.
   *
   * Runs every minute: '* * * * *'
   */
  static startUnconfirmedBookingCleaner() {
    cron.schedule('* * * * *', async () => {
      try {
        const TEN_MINUTES_MS = 15 * 60 * 1000;
        const cutoffTime = new Date(Date.now() - TEN_MINUTES_MS);

        // Find all INITIATED bookings created more than 10 minutes ago
        const expiredBookings = await prisma.booking.findMany({
          where: {
            status: BookingStatus.INITIATED,
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

        logger.info(
          `[BookingCleanupCron] Found ${expiredBookings.length} unconfirmed booking(s) older than 10 minutes. Processing cancellation...`
        );

        let canceledCount = 0;

        for (const booking of expiredBookings) {
          try {
            await prisma.$transaction(async (tx) => {
              // 1. Mark booking as CANCELED (concurrency guard: ensure status is still INITIATED)
              const updated = await tx.booking.updateMany({
                where: {
                  id: booking.id,
                  status: BookingStatus.INITIATED,
                },
                data: {
                  status: BookingStatus.CANCELED,
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
                logger.info(
                  `[BookingCleanupCron] Canceled expired booking ${booking.bookingRef} (${booking.id}) and released ${booking.seatCount} seat(s) back to event ${booking.eventId}.`
                );
              }
            });
          } catch (err) {
            logger.error(
              `[BookingCleanupCron] Failed to cancel expired booking ${booking.id}:`,
              err
            );
          }
        }

        // Invalidate event search cache if any seats were released
        if (canceledCount > 0) {
          await cacheService.delPattern('events:search:*');
        }
      } catch (error) {
        logger.error('[BookingCleanupCron] Error running unconfirmed booking cleanup:', error);
      }
    });
  }

  /**
   * Starts the background cron job to expire unconfirmed boost requests (status: PENDING)
   * whose payment has not been verified after 15 minutes.
   *
   * Runs every minute: '* * * * *'
   */
  static startUnconfirmedBoostCleaner() {
    cron.schedule('* * * * *', async () => {
      try {
        const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;
        const cutoffTime = new Date(Date.now() - FIFTEEN_MINUTES_MS);

        const expiredBoosts = await prisma.boostedEvent.updateMany({
          where: {
            status: 'PENDING',
            createdAt: {
              lte: cutoffTime,
            },
          },
          data: {
            status: 'EXPIRED',
            isActive: false,
          },
        });

        if (expiredBoosts.count > 0) {
          logger.info(
            `[BoostCleanupCron] Marked ${expiredBoosts.count} unconfirmed boost request(s) older than 15 minutes as EXPIRED.`
          );
        }

        // Auto-expire active boost campaigns whose endDate has passed
        const endedBoosts = await prisma.boostedEvent.updateMany({
          where: {
            isActive: true,
            endDate: { lte: new Date() },
          },
          data: {
            isActive: false,
            status: 'EXPIRED',
          },
        });

        if (endedBoosts.count > 0) {
          logger.info(
            `[BoostCleanupCron] Automatically expired ${endedBoosts.count} boost campaign(s) past end date.`
          );
        }
      } catch (error) {
        logger.error('[BoostCleanupCron] Error running unconfirmed boost request cleanup:', error);
      }
    });
  }
}
