import { EventMode, EventStatus, CommissionType } from '@prisma/client';
import { Event, EventCommission } from '../../../domain/entities';
import { IEventRepository } from '../../../domain/repositories/event.repository';
import { prisma } from '../../../config/prisma';

function mapEvent(e: any): any {
  if (!e) return null;
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
      district: (e.venueDetails as any)?.district || '',
      endDate: (e.venueDetails as any)?.endDate || '',
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

function mapCommission(c: any): EventCommission {
  if (!c) return c;
  return {
    ...c,
    platformValue: Number(c.platformValue),
  };
}

async function getHostRatingAndReviewsCount(hostId: string): Promise<{ rating: number; reviewsCount: number }> {
  const aggregate = await prisma.review.aggregate({
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

export class PrismaEventRepository implements IEventRepository {
  async findById(id: string): Promise<any> {
    const e = await prisma.event.findUnique({
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
    if (!e) return null;
    const mapped = mapEvent(e);
    const stats = await getHostRatingAndReviewsCount(e.hostId);
    mapped.rating = stats.rating;
    mapped.reviewsCount = stats.reviewsCount;
    return mapped;
  }

  async findMany(filters: {
    title?: string;
    mode?: EventMode;
    hostId?: string;
    startTimeFrom?: string;
    status?: EventStatus;
    category?: string;
    district?: string;
    keywords?: string[];
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<any[]> {
    const where: any = {};

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
            hasSome: [searchTerm],
          },
        },
      ];
    }

    if (filters.keywords && filters.keywords.length > 0) {
      where.keywords = {
        hasSome: filters.keywords,
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
      if (filters.minPrice !== undefined) where.price.gte = filters.minPrice;
      if (filters.maxPrice !== undefined) where.price.lte = filters.maxPrice;
    }

    // Map district (assuming it's stored inside the JSON venueDetails)
    if (filters.district) {
      where.venueDetails = {
        path: ['district'],
        equals: filters.district,
      };
    }

    // Determine sorting
    let orderBy: any = { startTime: 'asc' };
    if (filters.sortBy === 'price') {
      orderBy = { price: filters.sortOrder || 'asc' };
    } else if (filters.sortBy === 'rating' || filters.sortBy === 'popular') {
      orderBy = {
        likes: {
          _count: 'desc',
        },
      };
    } else if (filters.sortBy === 'createdAt') {
      orderBy = { createdAt: filters.sortOrder || 'desc' };
    } else if (filters.sortBy === 'startTime') {
      orderBy = { startTime: filters.sortOrder || 'asc' };
    }

    const events = await prisma.event.findMany({
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

    const mappedEvents = events.map(mapEvent);
    for (const me of mappedEvents) {
      const stats = await getHostRatingAndReviewsCount(me.hostId);
      me.rating = stats.rating;
      me.reviewsCount = stats.reviewsCount;
    }
    return mappedEvents;
  }

  async create(data: {
    hostId: string;
    title: string;
    posterUrl: string;
    mode: EventMode;
    venue?: {
      address: string;
      meetingLink?: string | null;
    };
    instructor?: {
      name: string;
      bio?: string;
      photoUrl?: string;
      companyName?: string;
      facebook?: string | null;
      instagram?: string | null;
      linkedin?: string | null;
    };
    startTime: Date;
    totalSeats: number;
    availableSeats: number;
    status?: EventStatus;
    version?: number;
    price?: number;
    duration?: string;
    durationHours?: number;
    description?: string;
    category?: string;
    keywords?: string[];
    videoUrls?: string[];
    images?: string[];
    venueDetails?: any;
    commissionType?: CommissionType;
    platformValue?: number;
  }): Promise<Event> {
    let instructorId: string | null = null;
    let venueId: string | null = null;

    if (data.instructor) {
      const inst = await prisma.instructor.create({
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
      const venue = await prisma.venue.create({
        data: {
          address: data.venue.address || '',
          meetingLink: data.venue.meetingLink || null,
        },
      });
      venueId = venue.id;
    }

    const { venue, instructor, commissionType, platformValue, ...rest } = data;
    const created = await prisma.event.create({
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

  async update(id: string, data: any): Promise<Event> {
    const updated = await prisma.event.update({
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

  async findPendingEvents(): Promise<any[]> {
    const events = await prisma.event.findMany({
      where: { status: EventStatus.PENDING },
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

  async upsertCommission(
    eventId: string,
    commissionType: CommissionType,
    platformValue: number
  ): Promise<EventCommission> {
    const comm = await prisma.eventCommission.upsert({
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

  async decrementSeats(id: string, seatCount: number, currentVersion: number): Promise<boolean> {
    const updateResult = await prisma.event.updateMany({
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

  async incrementSeats(id: string, seatCount: number): Promise<Event> {
    const updated = await prisma.event.update({
      where: { id },
      data: {
        availableSeats: { increment: seatCount },
        version: { increment: 1 },
      },
    });
    return mapEvent(updated);
  }
}
