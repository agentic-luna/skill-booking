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
        ticketType: b.ticketType ? {
            ...b.ticketType,
            price: Number(b.ticketType.price),
            totalSeats: Number(b.ticketType.totalSeats),
            bookedSeats: Number(b.ticketType.bookedSeats),
        } : null,
        participants: Array.isArray(b.participants) ? b.participants.map((p) => ({
            ...p,
            ticketType: p.ticketType ? {
                ...p.ticketType,
                price: Number(p.ticketType.price),
                totalSeats: Number(p.ticketType.totalSeats),
                bookedSeats: Number(p.ticketType.bookedSeats),
            } : null,
        })) : [],
        event: b.event ? {
            ...b.event,
            availableSeats: Number(b.event.availableSeats),
            totalSeats: Number(b.event.totalSeats),
            version: Number(b.event.version),
            commission: b.event.commission ? {
                ...b.event.commission,
                platformValue: Number(b.event.commission.platformValue),
            } : null,
            instructor: b.event.instructor ? {
                id: b.event.instructor.id,
                name: b.event.instructor.name,
                bio: b.event.instructor.bio,
                photoUrl: b.event.instructor.photoUrl,
                companyName: b.event.instructor.companyName,
                facebook: b.event.instructor.facebook,
                instagram: b.event.instructor.instagram,
                linkedin: b.event.instructor.linkedin,
            } : null,
            venue: b.event.venue ? {
                id: b.event.venue.id,
                address: b.event.venue.address,
                meetingLink: b.event.venue.meetingLink,
            } : null,
            venueDetails: (b.event.instructor || b.event.venue || b.event.venueDetails) ? {
                address: b.event.venue?.address || '',
                meetingLink: b.event.venue?.meetingLink || '',
                district: b.event.venueDetails?.district || '',
                endDate: b.event.venueDetails?.endDate || '',
                instructorName: b.event.instructor?.name || '',
                companyName: b.event.instructor?.companyName || '',
                instructorBio: b.event.instructor?.bio || '',
                instructorPhoto: b.event.instructor?.photoUrl || '',
                instagram: b.event.instructor?.instagram || '',
                linkedin: b.event.instructor?.linkedin || '',
                facebook: b.event.instructor?.facebook || '',
            } : b.event.venueDetails,
        } : undefined,
    };
}
class PrismaBookingRepository {
    async findById(id) {
        const b = await prisma_1.prisma.booking.findUnique({
            where: { id },
            include: {
                ticketType: true,
                participants: {
                    include: { ticketType: true },
                },
                client: true,
                event: {
                    include: {
                        commission: true,
                        venue: true,
                        instructor: true,
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
                ticketType: true,
                participants: {
                    include: { ticketType: true },
                },
                client: true,
                event: {
                    include: {
                        commission: true,
                        venue: true,
                        instructor: true,
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
                ticketType: true,
                participants: {
                    include: { ticketType: true },
                },
                client: true,
                event: {
                    include: {
                        commission: true,
                        venue: true,
                        instructor: true,
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
                ticketType: true,
                participants: {
                    include: { ticketType: true },
                },
                client: true,
                event: {
                    include: {
                        commission: true,
                        venue: true,
                        instructor: true,
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
                ticketType: true,
                participants: {
                    include: { ticketType: true },
                },
                event: {
                    include: {
                        venue: true,
                        instructor: true,
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
        let participantRecords = Array.isArray(participants) && participants.length > 0 ? [...participants] : [];
        // Auto-fill missing participant slots up to seatCount using client account details
        if (participantRecords.length < data.seatCount) {
            const clientUser = await prisma_1.prisma.user.findUnique({ where: { id: data.clientId } });
            const clientName = clientUser ? `${clientUser.firstName || ''} ${clientUser.lastName || ''}`.trim() : 'Participant';
            const clientEmail = clientUser?.email || '';
            const clientMobile = clientUser?.phone || '';
            while (participantRecords.length < data.seatCount) {
                const isFirst = participantRecords.length === 0;
                participantRecords.push({
                    isPrimary: isFirst,
                    fullName: isFirst ? clientName : `${clientName} (Participant #${participantRecords.length + 1})`,
                    email: clientEmail,
                    mobile: clientMobile,
                });
            }
        }
        const createInput = {
            ...bookingData,
            participants: {
                create: participantRecords.map((p, idx) => ({
                    isPrimary: p.isPrimary !== undefined ? Boolean(p.isPrimary) : idx === 0,
                    fullName: String(p.fullName || `Participant #${idx + 1}`).trim(),
                    email: String(p.email || '').trim(),
                    mobile: String(p.mobile || '').trim(),
                    dob: p.dob ? String(p.dob) : null,
                    gender: p.gender ? String(p.gender) : null,
                    city: p.city ? String(p.city) : null,
                    state: p.state ? String(p.state) : null,
                    country: p.country ? String(p.country) : 'India',
                })),
            },
        };
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
