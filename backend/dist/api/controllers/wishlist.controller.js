"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WishlistController = void 0;
const di_container_1 = require("../di-container");
const api_response_1 = require("../common/api-response");
const manage_wishlist_1 = require("../../application/use-cases/wishlist/manage-wishlist");
class WishlistController {
    static async addToWishlist(req, res, next) {
        try {
            const { eventId } = req.body;
            const result = await di_container_1.mediator.send(new manage_wishlist_1.AddToWishlistCommand(req.user.id, eventId));
            return api_response_1.ApiResponse.created(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    static async removeFromWishlist(req, res, next) {
        try {
            const { eventId } = req.params;
            const result = await di_container_1.mediator.send(new manage_wishlist_1.RemoveFromWishlistCommand(req.user.id, eventId));
            return api_response_1.ApiResponse.success(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    static async getWishlist(req, res, next) {
        try {
            const result = await di_container_1.mediator.send(new manage_wishlist_1.GetUserWishlistQuery(req.user.id));
            return api_response_1.ApiResponse.success(res, result);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.WishlistController = WishlistController;
