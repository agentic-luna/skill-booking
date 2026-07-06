"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetBoostedEventsQueryHandler = exports.GetBoostedEventsQuery = void 0;
class GetBoostedEventsQuery {
    __tag = 'GetBoostedEventsQuery';
}
exports.GetBoostedEventsQuery = GetBoostedEventsQuery;
class GetBoostedEventsQueryHandler {
    boostedRepo;
    constructor(boostedRepo) {
        this.boostedRepo = boostedRepo;
    }
    async handle(query) {
        return this.boostedRepo.findActiveBoostedEvents();
    }
}
exports.GetBoostedEventsQueryHandler = GetBoostedEventsQueryHandler;
