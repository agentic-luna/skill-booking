"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaEventReviewRepository = void 0;
const prisma_1 = require("../../../config/prisma");
class PrismaEventReviewRepository {
    async create(data) {
        const review = await prisma_1.prisma.review.upsert({
            where: {
                clientId_eventId: {
                    clientId: data.clientId,
                    eventId: data.eventId,
                },
            },
            update: {
                rating: data.rating,
                comment: data.comment || null,
                bookingId: data.bookingId || null,
            },
            create: {
                eventId: data.eventId,
                bookingId: data.bookingId || null,
                clientId: data.clientId,
                rating: data.rating,
                comment: data.comment || null,
            },
            include: {
                client: true,
            },
        });
        return review;
    }
    async findByEventId(eventId) {
        const reviews = await prisma_1.prisma.review.findMany({
            where: { eventId },
            include: {
                client: true,
            },
            orderBy: { createdAt: 'desc' },
        });
        return reviews;
    }
    async findByHostId(hostId, page = 1, limit = 5) {
        const skip = (page - 1) * limit;
        const [reviews, total] = await prisma_1.prisma.$transaction([
            prisma_1.prisma.review.findMany({
                where: {
                    event: {
                        hostId,
                    },
                },
                include: {
                    client: true,
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma_1.prisma.review.count({
                where: {
                    event: {
                        hostId,
                    },
                },
            }),
        ]);
        return { reviews: reviews, total };
    }
    async findAverageRatingForEvent(eventId) {
        const aggregate = await prisma_1.prisma.review.aggregate({
            where: { eventId },
            _avg: { rating: true },
            _count: { rating: true },
        });
        return {
            averageRating: aggregate._avg.rating ? Math.round(aggregate._avg.rating * 10) / 10 : 0,
            totalReviews: aggregate._count.rating || 0,
        };
    }
    async findAverageRatingForHost(hostProfileId) {
        const aggregate = await prisma_1.prisma.review.aggregate({
            where: {
                event: {
                    hostId: hostProfileId,
                },
            },
            _avg: { rating: true },
            _count: { rating: true },
        });
        return {
            averageRating: aggregate._avg.rating ? Math.round(aggregate._avg.rating * 10) / 10 : 0,
            totalReviews: aggregate._count.rating || 0,
        };
    }
}
exports.PrismaEventReviewRepository = PrismaEventReviewRepository;
