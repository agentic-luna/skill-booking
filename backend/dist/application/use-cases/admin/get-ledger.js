"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetLedgerQueryHandler = exports.GetLedgerQuery = void 0;
class GetLedgerQuery {
    __tag = 'GetLedgerQuery';
}
exports.GetLedgerQuery = GetLedgerQuery;
class GetLedgerQueryHandler {
    ledgerRepo;
    constructor(ledgerRepo) {
        this.ledgerRepo = ledgerRepo;
    }
    async handle(query) {
        const allLedgers = await this.ledgerRepo.findMany();
        let totalEscrowLiabilities = 0;
        let totalRealizedRevenue = 0;
        let totalRefunded = 0;
        allLedgers.forEach((l) => {
            if (l.type === 'PAYMENT_CAPTURE') {
                if (l.status === 'HELD') {
                    totalEscrowLiabilities += Number(l.hostLiability);
                }
                else if (l.status === 'RELEASED_TO_HOST') {
                    totalRealizedRevenue += Number(l.platformRevenue);
                }
            }
            else if (l.type === 'REFUND') {
                totalRefunded += Number(l.amountCaptured);
            }
        });
        return {
            totalEscrowLiabilities,
            totalRealizedRevenue,
            totalRefunded,
            ledgerCount: allLedgers.length,
        };
    }
}
exports.GetLedgerQueryHandler = GetLedgerQueryHandler;
