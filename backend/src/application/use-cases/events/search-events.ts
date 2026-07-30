import { EventMode, EventStatus } from '@prisma/client';
import { IEventRepository } from '../../../domain/repositories/event.repository';
import { ICacheService } from '../../services/cache.service';
import { IRequest, IRequestHandler } from '../../common/mediator';
import { logger } from '../../../api/di-container';

export class SearchEventsQuery implements IRequest<any[]> {
  readonly __tag = 'SearchEventsQuery';
  constructor(
    public readonly filters: {
      title?: string;
      mode?: EventMode;
      hostId?: string;
      startTimeFrom?: string;
    }
  ) {}
}

export class SearchEventsQueryHandler implements IRequestHandler<SearchEventsQuery, any[]> {
  constructor(
    private eventRepo: IEventRepository,
    private cacheService: ICacheService
  ) {}

  async handle(query: SearchEventsQuery): Promise<any[]> {
    const { filters } = query;
    const cacheKey = `events:search:title:${filters.title || ''}:mode:${filters.mode || ''}:host:${filters.hostId || ''}:from:${filters.startTimeFrom || 'all'}`;

    const cached = await this.cacheService.get<any[]>(cacheKey);
    if (cached) {
      logger.info(`[EventsQuery] Search Cache HIT for key: ${cacheKey}`);
      return cached;
    }

    logger.info(`[EventsQuery] Search Cache MISS for key: ${cacheKey}`);
    const events = await this.eventRepo.findMany({
      ...filters,
      status: EventStatus.APPROVED,
    });

    await this.cacheService.set(cacheKey, events, 300);
    return events;
  }
}
