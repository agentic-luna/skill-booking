"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetCancellationQuoteQueryHandler = exports.GetCancellationQuoteQuery = void 0;
const errors_1 = require("../../common/errors");
class GetCancellationQuoteQuery {
    bookingId;
    userId;
    role;
    __tag = 'GetCancellationQuoteQuery';
    constructor(bookingId, userId, role) {
        this.bookingId = bookingId;
        this.userId = userId;
        this.role = role;
    }
}
exports.GetCancellationQuoteQuery = GetCancellationQuoteQuery;
class GetCancellationQuoteQueryHandler {
    bookingRepo;
    configRepo;
    constructor(bookingRepo, configRepo) {
        this.bookingRepo = bookingRepo;
        this.configRepo = configRepo;
    }
    async handle(query) {
        const { bookingId, userId, role } = query;
        const booking = await this.bookingRepo.findById(bookingId);
        if (!booking) {
            throw new errors_1.NotFoundError('Booking not found');
        }
        if (booking.status === 'CANCELED' || booking.status === 'REFUNDED') {
            throw new errors_1.BadRequestError('Booking is already canceled or refunded.');
        }
        const event = booking.event;
        const now = new Date();
        const eventStartTime = new Date(event.startTime);
        const hoursDiff = (eventStartTime.getTime() - now.getTime()) / (1000 * 60 * 60);
        if (event.status === 'COMPLETED' || event.status === 'CANCELED' || hoursDiff <= 0) {
            throw new errors_1.BadRequestError('This event has already started, completed, or been canceled, so this booking cannot be canceled.');
        }
        const totalAmount = Number(booking.totalAmount);
        const setting = await this.configRepo.findPlatformSetting('refund_matrix');
        let refundPercentage = 100;
        if (setting && setting.value) {
            const matrix = setting.value;
            if (Array.isArray(matrix)) {
                const sorted = [...matrix].sort((a, b) => b.hoursBefore - a.hoursBefore);
                const matched = sorted.find((r) => hoursDiff >= r.hoursBefore);
                refundPercentage = matched ? matched.refundPercentage : 0;
            }
        }
        const refundAmount = totalAmount * (refundPercentage / 100);
        return {
            totalAmount,
            refundPercentage,
            refundAmount,
            hoursDiff,
        };
    }
}
exports.GetCancellationQuoteQueryHandler = GetCancellationQuoteQueryHandler;
