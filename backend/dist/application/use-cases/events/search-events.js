"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchEventsQueryHandler = exports.SearchEventsQuery = void 0;
const client_1 = require("@prisma/client");
const di_container_1 = require("../../../api/di-container");
class SearchEventsQuery {
    filters;
    __tag = 'SearchEventsQuery';
    constructor(filters) {
        this.filters = filters;
    }
}
exports.SearchEventsQuery = SearchEventsQuery;
class SearchEventsQueryHandler {
    eventRepo;
    cacheService;
    constructor(eventRepo, cacheService) {
        this.eventRepo = eventRepo;
        this.cacheService = cacheService;
    }
    async handle(query) {
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
        const cached = await this.cacheService.get(cacheKey);
        if (cached) {
            di_container_1.logger.info(`[EventsQuery] Search Cache HIT for key: ${cacheKey}`);
            return cached;
        }
        di_container_1.logger.info(`[EventsQuery] Search Cache MISS for key: ${cacheKey}`);
        const events = await this.eventRepo.findMany({
            ...activeFilters,
            status: client_1.EventStatus.APPROVED,
        });
        await this.cacheService.set(cacheKey, events, 300);
        return events;
    }
}
exports.SearchEventsQueryHandler = SearchEventsQueryHandler;
