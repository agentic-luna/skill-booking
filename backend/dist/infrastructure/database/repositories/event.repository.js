"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaEventRepository = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = require("../../../config/prisma");
function mapEvent(e) {
    if (!e)
        return null;
    const mapped = {
        ...e,
        availableSeats: Number(e.availableSeats),
        totalSeats: Number(e.totalSeats),
        version: Number(e.version),
        commission: e.commission ? mapCommission(e.commission) : null,
        boostedEvent: e.boostedEvent || null,
        instructor: e.instructor ? {
            id: e.instructor.id,
            name: e.instructor.name,
            bio: e.instructor.bio,
            photoUrl: e.instructor.photoUrl,
            companyName: e.instructor.companyName,
            facebook: e.instructor.facebook,
            instagram: e.instructor.instagram,
            linkedin: e.instructor.linkedin,
        } : null,
        venue: e.venue ? {
            id: e.venue.id,
            address: e.venue.address,
            meetingLink: e.venue.meetingLink,
        } : null,
    };
    if (e.instructor || e.venue || e.venueDetails) {
        mapped.venueDetails = {
            address: e.venue?.address || '',
            meetingLink: e.venue?.meetingLink || '',
            district: e.venueDetails?.district || '',
            endDate: e.venueDetails?.endDate || '',
            instructorName: e.instructor?.name || '',
            companyName: e.instructor?.companyName || '',
            instructorBio: e.instructor?.bio || '',
            instructorPhoto: e.instructor?.photoUrl || '',
            instagram: e.instructor?.instagram || '',
            linkedin: e.instructor?.linkedin || '',
            facebook: e.instructor?.facebook || '',
        };
    }
    return mapped;
}
function mapCommission(c) {
    if (!c)
        return c;
    return {
        ...c,
        platformValue: Number(c.platformValue),
    };
}
async function getHostRatingAndReviewsCount(hostId) {
    const aggregate = await prisma_1.prisma.review.aggregate({
        _avg: {
            rating: true,
        },
        _count: {
            rating: true,
        },
        where: {
            event: {
                hostId: hostId,
            },
        },
    });
    return {
        rating: aggregate._avg.rating ? parseFloat(aggregate._avg.rating.toFixed(1)) : 0,
        reviewsCount: aggregate._count.rating || 0,
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
                instructor: true,
                venue: true,
                boostedEvent: true,
            },
        });
        if (!e)
            return null;
        // Increment clicks for active boosted events
        const bEvent = e.boostedEvent;
        if (bEvent && bEvent.isActive && bEvent.status === 'ACTIVE') {
            prisma_1.prisma.boostedEvent.update({
                where: { id: bEvent.id },
                data: { clicks: { increment: 1 } }
            }).catch(err => console.error("[Telemetry] Failed to increment clicks", err));
        }
        const mapped = mapEvent(e);
        const stats = await getHostRatingAndReviewsCount(e.hostId);
        mapped.rating = stats.rating;
        mapped.reviewsCount = stats.reviewsCount;
        return mapped;
    }
    async findMany(filters) {
        const where = {};
        if (filters.status) {
            where.status = filters.status;
        }
        if (filters.title) {
            const searchTerm = filters.title.trim();
            where.OR = [
                {
                    title: {
                        contains: searchTerm,
                        mode: 'insensitive',
                    },
                },
                {
                    description: {
                        contains: searchTerm,
                        mode: 'insensitive',
                    },
                },
                {
                    category: {
                        contains: searchTerm,
                        mode: 'insensitive',
                    },
                },
                {
                    keywords: {
                        hasSome: [
                            searchTerm,
                            searchTerm.toLowerCase(),
                            searchTerm.toUpperCase(),
                            searchTerm.charAt(0).toUpperCase() + searchTerm.slice(1).toLowerCase(),
                        ],
                    },
                },
            ];
        }
        if (filters.keywords && filters.keywords.length > 0) {
            const searchKeywords = filters.keywords.reduce((acc, kw) => {
                acc.push(kw);
                acc.push(kw.toLowerCase());
                acc.push(kw.toUpperCase());
                const capitalized = kw.charAt(0).toUpperCase() + kw.slice(1).toLowerCase();
                if (!acc.includes(capitalized))
                    acc.push(capitalized);
                return acc;
            }, []);
            where.keywords = {
                hasSome: searchKeywords,
            };
        }
        if (filters.mode) {
            where.mode = filters.mode;
        }
        if (filters.hostId) {
            where.hostId = filters.hostId;
        }
        // STRICT DATE ENFORCEMENT: Date must be greater than current date
        const now = new Date();
        const fromDate = filters.startTimeFrom ? new Date(filters.startTimeFrom) : now;
        where.startTime = {
            // If provided date is in the past, default to now. 
            // 'gt' ensures we strictly only get future events.
            gt: fromDate > now ? fromDate : now,
        };
        if (filters.category) {
            where.category = filters.category;
        }
        // Map price ranges
        if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
            where.price = {};
            if (filters.minPrice !== undefined)
                where.price.gte = filters.minPrice;
            if (filters.maxPrice !== undefined)
                where.price.lte = filters.maxPrice;
        }
        // Map district (assuming it's stored inside the JSON venueDetails)
        if (filters.district) {
            where.venueDetails = {
                path: ['district'],
                equals: filters.district,
            };
        }
        // Determine sorting
        let orderBy = { startTime: 'asc' };
        if (filters.sortBy === 'price') {
            orderBy = { price: filters.sortOrder || 'asc' };
        }
        else if (filters.sortBy === 'rating' || filters.sortBy === 'popular') {
            orderBy = {
                likes: {
                    _count: 'desc',
                },
            };
        }
        else if (filters.sortBy === 'createdAt') {
            orderBy = { createdAt: filters.sortOrder || 'desc' };
        }
        else if (filters.sortBy === 'startTime') {
            orderBy = { startTime: filters.sortOrder || 'asc' };
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
                instructor: true,
                venue: true,
                boostedEvent: true,
            },
            orderBy,
        });
        // Increment impressions for active boosted events
        const activeBoostedIds = events
            .filter(e => {
            const b = e.boostedEvent;
            return b !== null && b !== undefined && b.isActive && b.status === 'ACTIVE';
        })
            .map(e => e.boostedEvent.id);
        if (activeBoostedIds.length > 0) {
            prisma_1.prisma.boostedEvent.updateMany({
                where: { id: { in: activeBoostedIds } },
                data: { impressions: { increment: 1 } }
            }).catch(err => console.error("[Telemetry] Failed to increment impressions", err));
        }
        const mappedEvents = events.map(mapEvent);
        for (const me of mappedEvents) {
            const stats = await getHostRatingAndReviewsCount(me.hostId);
            me.rating = stats.rating;
            me.reviewsCount = stats.reviewsCount;
        }
        // Sort active boosted events to the top ("Top Event Listings")
        mappedEvents.sort((a, b) => {
            const aBoosted = a.boostedEvent && a.boostedEvent.isActive && a.boostedEvent.status === 'ACTIVE' ? 1 : 0;
            const bBoosted = b.boostedEvent && b.boostedEvent.isActive && b.boostedEvent.status === 'ACTIVE' ? 1 : 0;
            return bBoosted - aBoosted;
        });
        return mappedEvents;
    }
    async create(data) {
        let instructorId = null;
        let venueId = null;
        if (data.instructor) {
            const inst = await prisma_1.prisma.instructor.create({
                data: {
                    name: data.instructor.name,
                    bio: data.instructor.bio || '',
                    photoUrl: data.instructor.photoUrl || '',
                    companyName: data.instructor.companyName || '',
                    facebook: data.instructor.facebook || null,
                    instagram: data.instructor.instagram || null,
                    linkedin: data.instructor.linkedin || null,
                },
            });
            instructorId = inst.id;
        }
        if (data.venue) {
            const venue = await prisma_1.prisma.venue.create({
                data: {
                    address: data.venue.address || '',
                    meetingLink: data.venue.meetingLink || null,
                },
            });
            venueId = venue.id;
        }
        const { venue, instructor, commissionType, platformValue, ...rest } = data;
        const created = await prisma_1.prisma.event.create({
            data: {
                ...rest,
                instructorId,
                venueId,
                venueDetails: data.venueDetails || undefined,
                commission: commissionType ? {
                    create: {
                        commissionType,
                        platformValue: platformValue || 0,
                    }
                } : undefined,
            },
            include: {
                instructor: true,
                venue: true,
                commission: true,
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
            },
        });
        return mapEvent(created);
    }
    async update(id, data) {
        const updated = await prisma_1.prisma.event.update({
            where: { id },
            data,
            include: {
                instructor: true,
                venue: true,
                commission: true,
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
            },
        });
        return mapEvent(updated);
    }
    async findPendingEvents() {
        const events = await prisma_1.prisma.event.findMany({
            where: { status: client_1.EventStatus.PENDING },
            include: {
                instructor: true,
                venue: true,
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
