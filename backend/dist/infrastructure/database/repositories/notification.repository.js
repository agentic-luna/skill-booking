"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaNotificationRepository = void 0;
const prisma_1 = require("../../../config/prisma");
class PrismaNotificationRepository {
    async findById(id) {
        return prisma_1.prisma.notificationLog.findUnique({ where: { id } });
    }
    async findMany(filters, skip, take) {
        return prisma_1.prisma.notificationLog.findMany({
            where: filters,
            orderBy: { sentAt: 'desc' },
            skip,
            take,
            include: {
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
        });
    }
    async count(filters) {
        return prisma_1.prisma.notificationLog.count({ where: filters });
    }
    async create(data) {
        return prisma_1.prisma.notificationLog.create({ data });
    }
    async update(id, data) {
        return prisma_1.prisma.notificationLog.update({
            where: { id },
            data,
        });
    }
}
exports.PrismaNotificationRepository = PrismaNotificationRepository;
