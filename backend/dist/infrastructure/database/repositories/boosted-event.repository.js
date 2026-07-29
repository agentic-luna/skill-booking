"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaBoostedEventRepository = void 0;
const prisma_1 = require("../../../config/prisma");
class PrismaBoostedEventRepository {
    async upsert(eventId, data) {
        const item = await prisma_1.prisma.boostedEvent.upsert({
            where: { eventId },
            create: {
                eventId,
                priority: data.priority,
                startDate: data.startDate,
                endDate: data.endDate,
                isActive: data.isActive,
            },
            update: {
                priority: data.priority,
                startDate: data.startDate,
                endDate: data.endDate,
                isActive: data.isActive,
            },
            include: {
                event: true,
            },
        });
        return item;
    }
    async update(id, data) {
        return prisma_1.prisma.boostedEvent.update({
            where: { id },
            data
        });
    }
    async findPendingBoostRequests() {
        return prisma_1.prisma.boostedEvent.findMany({
            where: { status: 'PENDING' },
            include: {
                event: {
                    include: {
                        host: {
                            include: { user: true }
                        }
                    }
                }
            }
        });
    }
    async findActiveBoostedEvents() {
        const now = new Date();
        const items = await prisma_1.prisma.boostedEvent.findMany({
            where: {
                isActive: true,
                startDate: { lte: now },
                endDate: { gte: now },
            },
            include: {
                event: true,
            },
            orderBy: { priority: 'desc' },
        });
        return items;
    }
    async delete(eventId) {
        await prisma_1.prisma.boostedEvent.delete({
            where: { eventId },
        });
        return true;
    }
}
exports.PrismaBoostedEventRepository = PrismaBoostedEventRepository;
