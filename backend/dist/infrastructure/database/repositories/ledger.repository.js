"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaLedgerRepository = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = require("../../../config/prisma");
function mapLedger(l) {
    if (!l)
        return null;
    return {
        ...l,
        amountCaptured: Number(l.amountCaptured),
        platformRevenue: Number(l.platformRevenue),
        hostLiability: Number(l.hostLiability),
        booking: l.booking ? {
            ...l.booking,
            seatCount: Number(l.booking.seatCount),
        } : undefined,
    };
}
class PrismaLedgerRepository {
    async create(data) {
        const created = await prisma_1.prisma.transactionLedger.create({ data });
        return mapLedger(created);
    }
    async update(id, data) {
        const updated = await prisma_1.prisma.transactionLedger.update({
            where: { id },
            data,
        });
        return mapLedger(updated);
    }
    async updateMany(ids, data) {
        return prisma_1.prisma.transactionLedger.updateMany({
            where: { id: { in: ids } },
            data,
        });
    }
    async findMany(filters) {
        const ledgers = await prisma_1.prisma.transactionLedger.findMany({
            where: filters,
            include: {
                booking: {
                    select: {
                        seatCount: true,
                        eventId: true,
                    },
                },
            },
        });
        return ledgers.map(mapLedger);
    }
    async findPendingHostPayouts(hostProfileId) {
        const ledgers = await prisma_1.prisma.transactionLedger.findMany({
            where: {
                status: client_1.LedgerStatus.HELD,
                booking: {
                    event: { hostId: hostProfileId },
                },
            },
        });
        return ledgers.map(mapLedger);
    }
}
exports.PrismaLedgerRepository = PrismaLedgerRepository;
