import { IRequest, IRequestHandler } from '../../common/mediator';
import { IBoostedEventRepository } from '../../../domain/repositories/boosted-event.repository';
import { NotFoundError } from '../../common/errors';
import { prisma } from '../../../config/prisma';

export class GetBoostAnalyticsQuery implements IRequest<any> {
  readonly __tag = 'GetBoostAnalyticsQuery';
  constructor(public readonly eventId: string) {}
}

export class GetBoostAnalyticsQueryHandler implements IRequestHandler<GetBoostAnalyticsQuery, any> {
  constructor(private boostedRepo: IBoostedEventRepository) {}

  async handle(query: GetBoostAnalyticsQuery): Promise<any> {
    const { eventId } = query;

    const boost = await prisma.boostedEvent.findFirst({
      where: { eventId },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            price: true,
            availableSeats: true,
            totalSeats: true,
          },
        },
      },
    });

    if (!boost) {
      throw new NotFoundError('No boost promotion record found for this event.');
    }

    // Get confirmed booking statistics for this event
    const confirmedBookings = await prisma.booking.aggregate({
      where: {
        eventId,
        status: 'CONFIRMED',
      },
      _sum: {
        totalAmount: true,
        seatCount: true,
      },
      _count: {
        id: true,
      },
    });

    const impressions = boost.impressions || 0;
    const clicks = boost.clicks || 0;
    const conversions = boost.conversions || 0;
    const boostPrice = boost.price || 0;
    const revenueGenerated = Number(confirmedBookings._sum.totalAmount) || 0;
    const totalSeatsBooked = Number(confirmedBookings._sum.seatCount) || 0;

    const ctr = impressions > 0 ? Number(((clicks / impressions) * 100).toFixed(2)) : 0;
    const conversionRate = clicks > 0 ? Number(((conversions / clicks) * 100).toFixed(2)) : 0;
    const roi = boostPrice > 0 ? Math.round(((revenueGenerated - boostPrice) / boostPrice) * 100) : 0;

    const now = new Date();
    const endDate = new Date(boost.endDate);
    const msRemaining = endDate.getTime() - now.getTime();
    const daysRemaining = msRemaining > 0 ? Math.ceil(msRemaining / (1000 * 60 * 60 * 24)) : 0;

    return {
      boostId: boost.id,
      eventId: boost.eventId,
      eventTitle: boost.event?.title || 'Event',
      tier: boost.tier,
      priority: boost.priority,
      status: boost.status,
      isActive: boost.isActive,
      boostPrice,
      startDate: boost.startDate,
      endDate: boost.endDate,
      daysRemaining,
      impressions,
      clicks,
      conversions,
      totalSeatsBooked,
      revenueGenerated,
      ctr,
      conversionRate,
      roi,
    };
  }
}
