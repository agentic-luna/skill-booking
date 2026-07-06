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
        const cacheKey = `events:search:title:${filters.title || ''}:mode:${filters.mode || ''}:host:${filters.hostId || ''}:from:${filters.startTimeFrom || ''}`;
        const cached = await this.cacheService.get(cacheKey);
        if (cached) {
            di_container_1.logger.info(`[EventsQuery] Search Cache HIT for key: ${cacheKey}`);
            return cached;
        }
        di_container_1.logger.info(`[EventsQuery] Search Cache MISS for key: ${cacheKey}`);
        const events = await this.eventRepo.findMany({
            ...filters,
            status: client_1.EventStatus.APPROVED,
        });
        await this.cacheService.set(cacheKey, events, 300);
        return events;
    }
}
exports.SearchEventsQueryHandler = SearchEventsQueryHandler;
