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
      posterUrl: string;
      mode: EventMode;
      venueDetails?: any;
      startTime: string;
      totalSeats: number;
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
      throw new BadRequestError('Host Profile not found. Please complete KYC registration first.');
    }

    if (hostProfile.kycStatus !== KycStatus.APPROVED) {
      throw new ForbiddenError('Cannot create events. Your KYC verification status is not APPROVED.');
    }

    const event = await this.eventRepo.create({
      hostId: hostProfile.id,
      title: data.title,
      posterUrl: data.posterUrl,
      mode: data.mode,
      venueDetails: data.venueDetails,
      startTime: new Date(data.startTime),
      totalSeats: data.totalSeats,
      availableSeats: data.totalSeats,
      status: EventStatus.PENDING,
      version: 1,
    });

    // Invalidate event listings caches
    await this.cacheService.delPattern('events:search:*');

    return event;
  }
}
