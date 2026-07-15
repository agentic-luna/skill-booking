"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetHostDashboardQueryHandler = exports.GetHostDashboardQuery = void 0;
const prisma_1 = require("../../../config/prisma");
class GetHostDashboardQuery {
    hostProfileId;
    __tag = 'GetHostDashboardQuery';
    constructor(hostProfileId) {
        this.hostProfileId = hostProfileId;
    }
}
exports.GetHostDashboardQuery = GetHostDashboardQuery;
class GetHostDashboardQueryHandler {
    eventRepo;
    ledgerRepo;
    constructor(eventRepo, ledgerRepo) {
        this.eventRepo = eventRepo;
        this.ledgerRepo = ledgerRepo;
    }
    async handle(query) {
        const { hostProfileId } = query;
        // 1. Fetch host events
        const events = await this.eventRepo.findMany({ hostId: hostProfileId });
        const eventIds = events.map((e) => e.id);
        // If host has no events, return empty analytics payload
        if (eventIds.length === 0) {
            const monthlyRevenue = [];
            for (let i = 5; i >= 0; i--) {
                const d = new Date();
                d.setMonth(d.getMonth() - i);
                monthlyRevenue.push({ month: d.toLocaleString('default', { month: 'short' }), earnings: 0 });
            }
            const weeklyBookings = [];
            for (let i = 6; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                weeklyBookings.push({ day: d.toLocaleString('default', { weekday: 'short' }), bookings: 0 });
            }
            return {
                totalEarnings: 0,
                heldEscrow: 0,
                activeTicketSales: 0,
                totalRevenue: 0,
                grossRevenue: 0,
                eventsCount: 0,
                averageRating: null,
                monthlyRevenue,
                weeklyBookings,
                recentBookings: [],
            };
        }
        // 2. Fetch all transaction ledgers referencing these events
        const ledgers = (await this.ledgerRepo.findMany({
            booking: {
                eventId: { in: eventIds },
            },
        }));
        let totalEarnings = 0;
        let heldEscrow = 0;
        ledgers.forEach((l) => {
            const hostVal = Number(l.hostLiability);
            if (l.status === 'RELEASED_TO_HOST') {
                totalEarnings += hostVal;
            }
            else if (l.status === 'HELD') {
                heldEscrow += hostVal;
            }
        });
        // 3. Aggregate ticket sales and revenue metrics
        let activeTicketSales = 0;
        let totalRevenue = 0;
        ledgers.forEach((l) => {
            if (l.type === 'PAYMENT_CAPTURE' && l.status !== 'REFUNDED_TO_CLIENT') {
                activeTicketSales += l.booking.seatCount;
                totalRevenue += Number(l.amountCaptured);
            }
        });
        // 4. Calculate Average Rating
        const reviewsAgg = await prisma_1.prisma.review.aggregate({
            where: {
                eventId: { in: eventIds },
            },
            _avg: {
                rating: true,
            },
        });
        const averageRating = reviewsAgg._avg.rating ? parseFloat(reviewsAgg._avg.rating.toFixed(2)) : null;
        // 5. Aggregate monthly revenue (captured payments) for the last 6 months
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setDate(1);
        sixMonthsAgo.setHours(0, 0, 0, 0);
        const ledgerList = await prisma_1.prisma.transactionLedger.findMany({
            where: {
                booking: {
                    eventId: { in: eventIds },
                },
                type: 'PAYMENT_CAPTURE',
                status: { not: 'REFUNDED_TO_CLIENT' },
                createdAt: { gte: sixMonthsAgo },
            },
            select: {
                amountCaptured: true,
                createdAt: true,
            },
        });
        const monthlyRevenueMap = {};
        const monthlyRevenue = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const monthName = d.toLocaleString('default', { month: 'short' });
            monthlyRevenueMap[monthName] = 0;
            monthlyRevenue.push({ month: monthName, earnings: 0 });
        }
        ledgerList.forEach((ledger) => {
            const monthName = new Date(ledger.createdAt).toLocaleString('default', { month: 'short' });
            if (monthName in monthlyRevenueMap) {
                monthlyRevenueMap[monthName] += Number(ledger.amountCaptured);
            }
        });
        monthlyRevenue.forEach((item) => {
            item.earnings = parseFloat(monthlyRevenueMap[item.month].toFixed(2));
        });
        // 6. Aggregate weekly bookings by day of week for the past week
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        sevenDaysAgo.setHours(0, 0, 0, 0);
        const bookingList = await prisma_1.prisma.booking.findMany({
            where: {
                eventId: { in: eventIds },
                createdAt: { gte: sevenDaysAgo },
            },
            select: {
                createdAt: true,
            },
        });
        const weeklyBookingsMap = {};
        const weeklyBookings = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dayName = d.toLocaleString('default', { weekday: 'short' });
            weeklyBookingsMap[dayName] = 0;
            weeklyBookings.push({ day: dayName, bookings: 0 });
        }
        bookingList.forEach((booking) => {
            const dayName = new Date(booking.createdAt).toLocaleString('default', { weekday: 'short' });
            if (dayName in weeklyBookingsMap) {
                weeklyBookingsMap[dayName] += 1;
            }
        });
        weeklyBookings.forEach((item) => {
            item.bookings = weeklyBookingsMap[item.day];
        });
        // 7. Get top 5-10 most recent bookings
        const recentBookingsList = await prisma_1.prisma.booking.findMany({
            where: {
                eventId: { in: eventIds },
            },
            include: {
                client: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
                event: {
                    select: {
                        title: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: 10,
        });
        const recentBookings = recentBookingsList.map((b) => ({
            id: b.id,
            createdAt: b.createdAt,
            status: b.status,
            amount: Number(b.totalAmount),
            event: {
                title: b.event.title,
            },
            client: {
                user: {
                    firstName: b.client.firstName,
                    lastName: b.client.lastName,
                    email: b.client.email,
                },
            },
        }));
        return {
            totalEarnings,
            heldEscrow,
            activeTicketSales,
            totalRevenue,
            grossRevenue: totalRevenue,
            eventsCount: events.length,
            averageRating,
            monthlyRevenue,
            weeklyBookings,
            recentBookings,
        };
    }
}
exports.GetHostDashboardQueryHandler = GetHostDashboardQueryHandler;
