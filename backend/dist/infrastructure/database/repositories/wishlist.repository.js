"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaWishlistRepository = void 0;
const prisma_1 = require("../../../config/prisma");
class PrismaWishlistRepository {
    async add(clientId, eventId) {
        const clientProfile = await prisma_1.prisma.clientProfile.upsert({
            where: { userId: clientId },
            update: {},
            create: { userId: clientId },
        });
        return prisma_1.prisma.wishlist.upsert({
            where: {
                clientId_eventId: { clientId, eventId },
            },
            create: { clientId, clientProfileId: clientProfile.id, eventId },
            update: { clientProfileId: clientProfile.id },
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
        });
    }
    async remove(clientId, eventId) {
        try {
            await prisma_1.prisma.wishlist.delete({
                where: {
                    clientId_eventId: { clientId, eventId },
                },
            });
            return true;
        }
        catch {
            return false;
        }
    }
    async findByClient(clientId) {
        return prisma_1.prisma.wishlist.findMany({
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
        const item = await prisma_1.prisma.wishlist.findUnique({
            where: {
                clientId_eventId: { clientId, eventId },
            },
        });
        return !!item;
    }
}
exports.PrismaWishlistRepository = PrismaWishlistRepository;
