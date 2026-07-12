import { EventMode, EventStatus, KycStatus } from '@prisma/client';
import { IEventRepository } from '../../../domain/repositories/event.repository';
import { IUserRepository } from '../../../domain/repositories/user.repository';
import { ICacheService } from '../../services/cache.service';
import { IRequest, IRequestHandler } from '../../common/mediator';
import { BadRequestError, ForbiddenError } from '../../common/errors';

export class CreateEventCommand implements IRequest<any> {
  readonly __tag = 'CreateEventCommand';
  constructor(
    public readonly userId: string,
    public readonly data: {
      title: string;
      posterUrl?: string;  // optional — defaults to empty string if not provided
      mode: EventMode;
      venueDetails?: any;
      startTime: string;
      totalSeats: number;
      price?: number;
      duration?: string;
      description?: string;
      category?: string;
    }
  ) {}
}

export class CreateEventCommandHandler implements IRequestHandler<CreateEventCommand, any> {
  constructor(
    private eventRepo: IEventRepository,
    private userRepo: IUserRepository,
    private cacheService: ICacheService
  ) {}

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

    const event = await this.eventRepo.create({
      hostId: hostProfile.id,
      title: data.title,
      posterUrl: data.posterUrl || '',  // default to empty string if not provided
      mode: data.mode,
      venueDetails: data.venueDetails,
      startTime: new Date(data.startTime),
      totalSeats: data.totalSeats,
      availableSeats: data.totalSeats,
      status: EventStatus.PENDING,
      version: 1,
      price: data.price,
      duration: data.duration,
      description: data.description,
      category: data.category,
    });

    // Invalidate event listings caches
    await this.cacheService.delPattern('events:search:*');

    return event;
  }
}
