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
      category?: string;
      district?: string;
      minPrice?: number;
      maxPrice?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    }
  ) { }
}

export class SearchEventsQueryHandler implements IRequestHandler<SearchEventsQuery, any[]> {
  constructor(
    private eventRepo: IEventRepository,
    private cacheService: ICacheService
  ) { }

  async handle(query: SearchEventsQuery): Promise<any[]> {
    const { filters } = query;

    // 1. Enforce "Don't show old events"
    // If no startTimeFrom is provided, or if the provided time is in the past, default to NOW.
    const now = new Date().toISOString();
    const effectiveStartTimeFrom = (filters.startTimeFrom && new Date(filters.startTimeFrom) > new Date())
      ? filters.startTimeFrom
      : now;

    // 2. Set defaults for sorting
    // By default, sort by nearest upcoming 'startTime' in ascending order.
    // If you prefer newest created events, you could change this default to 'createdAt' and 'desc'.
    const sortBy = filters.sortBy || 'startTime';
    const sortOrder = filters.sortOrder || 'asc';

    const activeFilters = {
      ...filters,
      startTimeFrom: effectiveStartTimeFrom,
      sortBy,
      sortOrder,
    };

    // 3. Create a reliable, deterministic cache key using base64 encoded JSON
    // This prevents cache key collisions when adding multiple dynamic parameters.
    const filterString = JSON.stringify(activeFilters);
    const cacheKey = `events:search:${Buffer.from(filterString).toString('base64')}`;

    const cached = await this.cacheService.get<any[]>(cacheKey);
    if (cached) {
      logger.info(`[EventsQuery] Search Cache HIT for key: ${cacheKey}`);
      return cached;
    }

    logger.info(`[EventsQuery] Search Cache MISS for key: ${cacheKey}`);

    const events = await this.eventRepo.findMany({
      ...activeFilters,
      status: EventStatus.APPROVED,
    });

    await this.cacheService.set(cacheKey, events, 300);
    return events;
  }
}