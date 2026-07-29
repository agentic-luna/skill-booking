"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetBoostRequestsQueryHandler = exports.GetBoostRequestsQuery = void 0;
class GetBoostRequestsQuery {
    __tag = 'GetBoostRequestsQuery';
}
exports.GetBoostRequestsQuery = GetBoostRequestsQuery;
class GetBoostRequestsQueryHandler {
    boostedRepo;
    constructor(boostedRepo) {
        this.boostedRepo = boostedRepo;
    }
    async handle(query) {
        return this.boostedRepo.findAllBoostRequests();
    }
}
exports.GetBoostRequestsQueryHandler = GetBoostRequestsQueryHandler;
