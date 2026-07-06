"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaEventRepository = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = require("../../../config/prisma");
function mapEvent(e) {
    if (!e)
        return null;
    return {
        ...e,
        availableSeats: Number(e.availableSeats),
        totalSeats: Number(e.totalSeats),
        version: Number(e.version),
        commission: e.commission ? mapCommission(e.commission) : null,
    };
}
function mapCommission(c) {
    if (!c)
        return c;
    return {
        ...c,
        platformValue: Number(c.platformValue),
    };
}
class PrismaEventRepository {
    async findById(id) {
        const e = await prisma_1.prisma.event.findUnique({
            where: { id },
            include: {
                host: {
                    select: {
                        id: true,
                        user: {
                            select: {
                                firstName: true,
                                lastName: true,
                                email: true,
                                phone: true,
                            },
                        },
                    },
                },
                commission: true,
            },
        });
        return mapEvent(e);
    }
    async findMany(filters) {
        const where = {};
        if (filters.status) {
            where.status = filters.status;
        }
        if (filters.title) {
            where.title = {
                contains: filters.title,
                mode: 'insensitive',
            };
        }
        if (filters.mode) {
            where.mode = filters.mode;
        }
        if (filters.hostId) {
            where.hostId = filters.hostId;
        }
        if (filters.startTimeFrom) {
            where.startTime = {
                gte: new Date(filters.startTimeFrom),
            };
        }
        const events = await prisma_1.prisma.event.findMany({
            where,
            include: {
                host: {
                    select: {
                        user: {
                            select: {
                                firstName: true,
                                lastName: true,
                            },
                        },
                    },
                },
                commission: true,
            },
            orderBy: {
                startTime: 'asc',
            },
        });
        return events.map(mapEvent);
    }
    async create(data) {
        const created = await prisma_1.prisma.event.create({ data });
        return mapEvent(created);
    }
    async update(id, data) {
        const updated = await prisma_1.prisma.event.update({
            where: { id },
            data,
        });
        return mapEvent(updated);
    }
    async findPendingEvents() {
        const events = await prisma_1.prisma.event.findMany({
            where: { status: client_1.EventStatus.PENDING },
            include: {
                host: {
                    include: {
                        user: {
                            select: {
                                firstName: true,
                                lastName: true,
                                phone: true,
                            },
                        },
                    },
                },
            },
        });
        return events.map(mapEvent);
    }
    async upsertCommission(eventId, commissionType, platformValue) {
        const comm = await prisma_1.prisma.eventCommission.upsert({
            where: { eventId },
            update: {
                commissionType,
                platformValue,
            },
            create: {
                eventId,
                commissionType,
                platformValue,
            },
        });
        return mapCommission(comm);
    }
    async decrementSeats(id, seatCount, currentVersion) {
        const updateResult = await prisma_1.prisma.event.updateMany({
            where: {
                id,
                version: currentVersion,
                availableSeats: { gte: seatCount },
            },
            data: {
                availableSeats: { decrement: seatCount },
                version: { increment: 1 },
            },
        });
        return updateResult.count > 0;
    }
    async incrementSeats(id, seatCount) {
        const updated = await prisma_1.prisma.event.update({
            where: { id },
            data: {
                availableSeats: { increment: seatCount },
                version: { increment: 1 },
            },
        });
        return mapEvent(updated);
    }
}
exports.PrismaEventRepository = PrismaEventRepository;
