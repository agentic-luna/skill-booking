"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaBookingRepository = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = require("../../../config/prisma");
function mapBooking(b) {
    if (!b)
        return null;
    return {
        ...b,
        totalAmount: Number(b.totalAmount),
        seatCount: Number(b.seatCount),
        platformValue: b.platformValue ? Number(b.platformValue) : null,
        event: b.event ? {
            ...b.event,
            availableSeats: Number(b.event.availableSeats),
            totalSeats: Number(b.event.totalSeats),
            version: Number(b.event.version),
            commission: b.event.commission ? {
                ...b.event.commission,
                platformValue: Number(b.event.commission.platformValue),
            } : null,
        } : undefined,
    };
}
class PrismaBookingRepository {
    async findById(id) {
        const b = await prisma_1.prisma.booking.findUnique({
            where: { id },
            include: {
                participants: true,
                event: {
                    include: {
                        commission: true,
                        host: {
                            include: {
                                user: true,
                            },
                        },
                    },
                },
                refundRequest: true,
            },
        });
        return mapBooking(b);
    }
    async findFirstByRef(bookingRef) {
        const b = await prisma_1.prisma.booking.findFirst({
            where: { bookingRef },
            include: {
                participants: true,
                client: true,
                event: {
                    include: {
                        commission: true,
                        host: {
                            include: {
                                user: true,
                            },
                        },
                    },
                },
            },
        });
        return mapBooking(b);
    }
    async findByRazorpayOrderId(razorpayOrderId) {
        if (!razorpayOrderId)
            return null;
        const b = await prisma_1.prisma.booking.findUnique({
            where: { razorpayOrderId },
            include: {
                participants: true,
                client: true,
                event: {
                    include: {
                        commission: true,
                        host: {
                            include: {
                                user: true,
                            },
                        },
                    },
                },
            },
        });
        return mapBooking(b);
    }
    async findByRazorpayPaymentId(razorpayPaymentId) {
        if (!razorpayPaymentId)
            return null;
        const b = await prisma_1.prisma.booking.findFirst({
            where: { razorpayPaymentId },
            include: {
                participants: true,
                client: true,
                event: {
                    include: {
                        commission: true,
                        host: {
                            include: {
                                user: true,
                            },
                        },
                    },
                },
            },
        });
        return mapBooking(b);
    }
    async findMany(filters) {
        const list = await prisma_1.prisma.booking.findMany({
            where: filters,
            include: {
                participants: true,
                event: {
                    include: {
                        host: {
                            include: {
                                user: true,
                            },
                        },
                    },
                },
                client: true,
                refundRequest: true,
            },
            orderBy: { createdAt: 'desc' },
        });
        return list.map(mapBooking);
    }
    async create(data) {
        const { participants, ...bookingData } = data;
        const createInput = {
            ...bookingData,
        };
        if (Array.isArray(participants) && participants.length > 0) {
            createInput.participants = {
                create: participants.map((p, idx) => ({
                    isPrimary: p.isPrimary !== undefined ? Boolean(p.isPrimary) : idx === 0,
                    fullName: String(p.fullName || '').trim(),
                    email: String(p.email || '').trim(),
                    mobile: String(p.mobile || '').trim(),
                    dob: p.dob ? String(p.dob) : null,
                    gender: p.gender ? String(p.gender) : null,
                    city: p.city ? String(p.city) : null,
                    state: p.state ? String(p.state) : null,
                    country: p.country ? String(p.country) : 'India',
                })),
            };
        }
        const created = await prisma_1.prisma.booking.create({
            data: createInput,
            include: { participants: true },
        });
        return mapBooking(created);
    }
    async update(id, data) {
        const updated = await prisma_1.prisma.booking.update({
            where: { id },
            data,
            include: { participants: true },
        });
        return mapBooking(updated);
    }
    async updatePaymentDetails(bookingId, details) {
        const updated = await prisma_1.prisma.booking.update({
            where: { id: bookingId },
            data: details,
            include: { participants: true },
        });
        return mapBooking(updated);
    }
    async markPaymentCaptured(bookingId, details) {
        const updated = await prisma_1.prisma.booking.update({
            where: { id: bookingId },
            data: {
                status: client_1.BookingStatus.CONFIRMED,
                razorpayPaymentId: details.razorpayPaymentId,
                paymentMethod: details.paymentMethod || 'RAZORPAY',
                paymentCapturedAt: details.paymentCapturedAt || new Date(),
                paymentGateway: details.paymentGateway || 'RAZORPAY',
                webhookProcessed: true,
            },
            include: { participants: true },
        });
        return mapBooking(updated);
    }
}
exports.PrismaBookingRepository = PrismaBookingRepository;
