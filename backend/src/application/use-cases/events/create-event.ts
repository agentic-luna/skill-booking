import { EventMode, EventStatus, KycStatus, CommissionType } from '@prisma/client';
import { IEventRepository } from '../../../domain/repositories/event.repository';
import { IUserRepository } from '../../../domain/repositories/user.repository';
import { IConfigRepository } from '../../../domain/repositories/config.repository';
import { ICacheService } from '../../services/cache.service';
import { IRequest, IRequestHandler } from '../../common/mediator';
import { BadRequestError, ForbiddenError } from '../../common/errors';
import { parseDurationToHours } from '../../../utils/duration-parser';
import { parseCommissionRate } from '../../../utils/commission-parser';

export class CreateEventCommand implements IRequest<any> {
  readonly __tag = 'CreateEventCommand';
  constructor(
    public readonly userId: string,
    public readonly data: {
      title: string;
      posterUrl?: string;  // optional — defaults to empty string if not provided
      images?: string[];
      mode: EventMode;
      venue?: {
        address: string;
        meetingLink?: string | null;
        district?: string;
        endDate?: string;
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
      startTime: string;
      totalSeats: number;
      price?: number;
      duration?: string;
      description?: string;
      category?: string;
      keywords?: string[];
      videoUrls?: string[];
      questionnaire?: any;
      ticketTypes?: Array<{
        name: string;
        price: number;
        totalSeats: number;
      }>;
    }
  ) { }
}

export class CreateEventCommandHandler implements IRequestHandler<CreateEventCommand, any> {
  constructor(
    private eventRepo: IEventRepository,
    private userRepo: IUserRepository,
    private cacheService: ICacheService,
    private configRepo: IConfigRepository
  ) { }

  async handle(command: CreateEventCommand): Promise<any> {
    const { userId, data } = command;

    const hostProfile = await this.userRepo.findHostProfileByUserId(userId);
    if (!hostProfile) {
      throw new BadRequestError('Host profile not found. Please contact support.');
    }

    if (!hostProfile.govIdUrl) {
      throw new ForbiddenError('Cannot create events. Please submit your KYC documents first via the /hosts/kyc endpoint.');
    }

    if (hostProfile.kycStatus !== KycStatus.APPROVED) {
      throw new ForbiddenError('Cannot create events. Your KYC verification is ' + hostProfile.kycStatus + '. Please wait for admin approval.');
    }

    // Validate ticket types if provided
    if (data.ticketTypes && Array.isArray(data.ticketTypes) && data.ticketTypes.length > 0) {
      if (data.ticketTypes.length > 10) {
        throw new BadRequestError('An event can have a maximum of 10 ticket types.');
      }

      const namesSet = new Set<string>();
      for (const tt of data.ticketTypes) {
        if (!tt.name || typeof tt.name !== 'string' || tt.name.trim() === '') {
          throw new BadRequestError('Ticket type name is required.');
        }
        if (tt.price === undefined || tt.price === null || Number(tt.price) < 0) {
          throw new BadRequestError(`Invalid price for ticket type "${tt.name}". Price must be >= 0.`);
        }
        if (!tt.totalSeats || Number(tt.totalSeats) <= 0) {
          throw new BadRequestError(`Invalid total seats for ticket type "${tt.name}". Total seats must be > 0.`);
        }
        const normalizedName = tt.name.trim().toLowerCase();
        if (namesSet.has(normalizedName)) {
          throw new BadRequestError(`Duplicate ticket type name "${tt.name}" is not allowed.`);
        }
        namesSet.add(normalizedName);
      }
    }

    let totalSeats = Number(data.totalSeats) || 0;
    let basePrice = data.price !== undefined ? Number(data.price) : undefined;

    if (data.ticketTypes && Array.isArray(data.ticketTypes) && data.ticketTypes.length > 0) {
      const sumSeats = data.ticketTypes.reduce((acc, tt) => acc + Number(tt.totalSeats || 0), 0);
      if (!totalSeats || totalSeats <= 0) {
        totalSeats = sumSeats;
      }
      if (basePrice === undefined) {
        basePrice = Math.min(...data.ticketTypes.map(tt => Number(tt.price)));
      }
    }

    const durationHours = parseDurationToHours(data.duration);

    // Retrieve initial commission based on Platform Settings commissionRate
    let commissionType: CommissionType = CommissionType.PERCENTAGE;
    let platformValue = 15;
    try {
      const setting = await this.configRepo.findPlatformSetting('commissionRate');
      const parsed = parseCommissionRate(setting?.value);
      commissionType = parsed.commissionType;
      platformValue = parsed.platformValue;
    } catch (err) {
      // Default fallback in case of errors
    }

    const event = await this.eventRepo.create({
      hostId: hostProfile.id,
      title: data.title,
      posterUrl: data.posterUrl || '',  // default to empty string if not provided
      images: data.images || [],
      mode: data.mode,
      venue: data.venue,
      instructor: data.instructor,
      startTime: new Date(data.startTime),
      totalSeats: totalSeats,
      availableSeats: totalSeats,
      status: EventStatus.PENDING,
      version: 1,
      price: basePrice,
      duration: data.duration,
      durationHours,
      description: data.description,
      category: data.category,
      keywords: data.keywords || [],
      videoUrls: data.videoUrls || [],
      questionnaire: data.questionnaire,
      ticketTypes: data.ticketTypes ? data.ticketTypes.map(tt => ({
        name: tt.name.trim(),
        price: Number(tt.price),
        totalSeats: Number(tt.totalSeats),
      })) : undefined,
      venueDetails: {
        district: data.venue?.district || undefined,
        endDate: data.venue?.endDate || undefined,
      },
      commissionType,
      platformValue,
    });

    // Invalidate event listings caches
    await this.cacheService.delPattern('events:search:*');

    return event;
  }
}
