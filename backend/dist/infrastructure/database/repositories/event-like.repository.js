"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaEventLikeRepository = void 0;
const prisma_1 = require("../../../config/prisma");
class PrismaEventLikeRepository {
    async toggleLike(clientId, eventId) {
        const existing = await prisma_1.prisma.eventLike.findUnique({
            where: {
                clientId_eventId: { clientId, eventId },
            },
        });
        if (existing) {
            await prisma_1.prisma.eventLike.delete({
                where: { id: existing.id },
            });
            return { liked: false };
        }
        const like = await prisma_1.prisma.eventLike.create({
            data: { clientId, eventId },
            include: {
                event: true,
            },
        });
        return { liked: true, like };
    }
    async findByClient(clientId) {
        return prisma_1.prisma.eventLike.findMany({
            where: { clientId },
            include: {
                event: {
                    include: {
                        host: {
                            select: {
                                user: {
                                    select: { firstName: true, lastName: true },
                                },
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async exists(clientId, eventId) {
        const item = await prisma_1.prisma.eventLike.findUnique({
            where: {
                clientId_eventId: { clientId, eventId },
            },
        });
        return !!item;
    }
    async getLikeCountForEvent(eventId) {
        return prisma_1.prisma.eventLike.count({
            where: { eventId },
        });
    }
}
exports.PrismaEventLikeRepository = PrismaEventLikeRepository;
