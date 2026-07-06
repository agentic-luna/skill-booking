"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetHostDashboardQueryHandler = exports.GetHostDashboardQuery = void 0;
class GetHostDashboardQuery {
    hostProfileId;
    __tag = 'GetHostDashboardQuery';
    constructor(hostProfileId) {
        this.hostProfileId = hostProfileId;
    }
}
exports.GetHostDashboardQuery = GetHostDashboardQuery;
class GetHostDashboardQueryHandler {
    eventRepo;
    ledgerRepo;
    constructor(eventRepo, ledgerRepo) {
        this.eventRepo = eventRepo;
        this.ledgerRepo = ledgerRepo;
    }
    async handle(query) {
        const { hostProfileId } = query;
        // 1. Fetch host events
        const events = await this.eventRepo.findMany({ hostId: hostProfileId });
        const eventIds = events.map((e) => e.id);
        // 2. Fetch all transaction ledgers referencing these events
        const ledgers = (await this.ledgerRepo.findMany({
            booking: {
                eventId: { in: eventIds },
            },
        }));
        let totalEarnings = 0;
        let heldEscrow = 0;
        ledgers.forEach((l) => {
            const hostVal = Number(l.hostLiability);
            if (l.status === 'RELEASED_TO_HOST') {
                totalEarnings += hostVal;
            }
            else if (l.status === 'HELD') {
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
exports.GetHostDashboardQueryHandler = GetHostDashboardQueryHandler;
