import { IEventRepository } from '../../../domain/repositories/event.repository';
import { ILedgerRepository } from '../../../domain/repositories/ledger.repository';
import { IRequest, IRequestHandler } from '../../common/mediator';

export class GetHostDashboardQuery implements IRequest<any> {
  readonly __tag = 'GetHostDashboardQuery';
  constructor(public readonly hostProfileId: string) {}
}

export class GetHostDashboardQueryHandler implements IRequestHandler<GetHostDashboardQuery, any> {
  constructor(
    private eventRepo: IEventRepository,
    private ledgerRepo: ILedgerRepository
  ) {}

  async handle(query: GetHostDashboardQuery): Promise<any> {
    const { hostProfileId } = query;

    // 1. Fetch host events
    const events = await this.eventRepo.findMany({ hostId: hostProfileId });
    const eventIds = events.map((e) => e.id);

    // 2. Fetch all transaction ledgers referencing these events
    const ledgers = (await this.ledgerRepo.findMany({
      booking: {
        eventId: { in: eventIds },
      },
    })) as any[];

    let totalEarnings = 0;
    let heldEscrow = 0;

    ledgers.forEach((l) => {
      const hostVal = Number(l.hostLiability);
      if (l.status === 'RELEASED_TO_HOST') {
        totalEarnings += hostVal;
      } else if (l.status === 'HELD') {
        heldEscrow += hostVal;
      }
    });

    // 3. Aggregate ticket sales and revenue metrics
    let activeTicketSales = 0;
    let totalRevenue = 0;

    ledgers.forEach((l) => {
      if (l.type === 'PAYMENT_CAPTURE' && l.status !== 'REFUNDED_TO_CLIENT') {
        activeTicketSales += l.booking.seatCount;
        totalRevenue += Number(l.amountCaptured);
      }
    });

    return {
      totalEarnings,
      heldEscrow,
      activeTicketSales,
      totalRevenue,
      eventsCount: events.length,
    };
  }
}
