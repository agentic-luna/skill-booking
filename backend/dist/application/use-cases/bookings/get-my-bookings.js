"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetMyBookingsQueryHandler = exports.GetMyBookingsQuery = void 0;
class GetMyBookingsQuery {
    clientId;
    __tag = 'GetMyBookingsQuery';
    constructor(clientId) {
        this.clientId = clientId;
    }
}
exports.GetMyBookingsQuery = GetMyBookingsQuery;
class GetMyBookingsQueryHandler {
    bookingRepo;
    constructor(bookingRepo) {
        this.bookingRepo = bookingRepo;
    }
    async handle(query) {
        const { clientId } = query;
        const bookings = await this.bookingRepo.findMany({ clientId });
        return {
            bookings,
            count: bookings.length,
        };
    }
}
exports.GetMyBookingsQueryHandler = GetMyBookingsQueryHandler;
