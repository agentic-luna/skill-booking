"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingsController = void 0;
const di_container_1 = require("../di-container");
const checkout_1 = require("../../application/use-cases/bookings/checkout");
const cancel_booking_1 = require("../../application/use-cases/bookings/cancel-booking");
const api_response_1 = require("../common/api-response");
class BookingsController {
    static async checkout(req, res, next) {
        try {
            const { eventId, seatCount, customAmount } = req.body;
            const result = await di_container_1.mediator.send(new checkout_1.CheckoutCommand(req.user.id, eventId, Number(seatCount), customAmount ? Number(customAmount) : undefined));
            return api_response_1.ApiResponse.success(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    static async cancel(req, res, next) {
        try {
            const { bookingId } = req.params;
            const cancellation = await di_container_1.mediator.send(new cancel_booking_1.CancelBookingCommand(bookingId, req.user.id, req.user.role));
            return api_response_1.ApiResponse.success(res, cancellation);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.BookingsController = BookingsController;
