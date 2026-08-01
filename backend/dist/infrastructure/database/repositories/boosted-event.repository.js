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
                tier: data.tier,
                price: data.price,
                startDate: data.startDate,
                endDate: data.endDate,
                isActive: data.isActive,
            },
            update: {
                priority: data.priority,
                tier: data.tier,
                price: data.price,
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
    async findAllBoostRequests() {
        return prisma_1.prisma.boostedEvent.findMany({
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
    async findById(id) {
        return prisma_1.prisma.boostedEvent.findUnique({
            where: { id },
            include: { event: true },
        });
    }
    async findByRazorpayOrderId(razorpayOrderId) {
        if (!razorpayOrderId)
            return null;
        return prisma_1.prisma.boostedEvent.findUnique({
            where: { razorpayOrderId },
            include: { event: true },
        });
    }
    async findByRazorpayPaymentId(razorpayPaymentId) {
        if (!razorpayPaymentId)
            return null;
        return prisma_1.prisma.boostedEvent.findFirst({
            where: { razorpayPaymentId },
            include: { event: true },
        });
    }
    async updatePaymentDetails(id, details) {
        return prisma_1.prisma.boostedEvent.update({
            where: { id },
            data: details,
            include: { event: true },
        });
    }
    async markPaymentCaptured(id, details) {
        return prisma_1.prisma.boostedEvent.update({
            where: { id },
            data: {
                status: details.status || 'ACTIVE',
                isActive: details.isActive !== undefined ? details.isActive : true,
                razorpayPaymentId: details.razorpayPaymentId,
                paymentMethod: details.paymentMethod || 'RAZORPAY',
                paymentCapturedAt: details.paymentCapturedAt || new Date(),
                paymentGateway: details.paymentGateway || 'RAZORPAY',
                webhookProcessed: true,
            },
            include: { event: true },
        });
    }
    async delete(eventId) {
        await prisma_1.prisma.boostedEvent.delete({
            where: { eventId },
        });
        return true;
    }
}
exports.PrismaBoostedEventRepository = PrismaBoostedEventRepository;
