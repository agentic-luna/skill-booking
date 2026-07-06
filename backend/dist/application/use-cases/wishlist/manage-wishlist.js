"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetUserWishlistQueryHandler = exports.GetUserWishlistQuery = exports.RemoveFromWishlistCommandHandler = exports.RemoveFromWishlistCommand = exports.AddToWishlistCommandHandler = exports.AddToWishlistCommand = void 0;
const errors_1 = require("../../common/errors");
// 1. Add to Wishlist
class AddToWishlistCommand {
    clientId;
    eventId;
    __tag = 'AddToWishlistCommand';
    constructor(clientId, eventId) {
        this.clientId = clientId;
        this.eventId = eventId;
    }
}
exports.AddToWishlistCommand = AddToWishlistCommand;
class AddToWishlistCommandHandler {
    wishlistRepo;
    eventRepo;
    constructor(wishlistRepo, eventRepo) {
        this.wishlistRepo = wishlistRepo;
        this.eventRepo = eventRepo;
    }
    async handle(command) {
        const { clientId, eventId } = command;
        if (!eventId)
            throw new errors_1.BadRequestError('Event ID is required');
        const event = await this.eventRepo.findById(eventId);
        if (!event)
            throw new errors_1.NotFoundError('Event not found');
        const item = await this.wishlistRepo.add(clientId, eventId);
        return { success: true, item };
    }
}
exports.AddToWishlistCommandHandler = AddToWishlistCommandHandler;
// 2. Remove from Wishlist
class RemoveFromWishlistCommand {
    clientId;
    eventId;
    __tag = 'RemoveFromWishlistCommand';
    constructor(clientId, eventId) {
        this.clientId = clientId;
        this.eventId = eventId;
    }
}
exports.RemoveFromWishlistCommand = RemoveFromWishlistCommand;
class RemoveFromWishlistCommandHandler {
    wishlistRepo;
    constructor(wishlistRepo) {
        this.wishlistRepo = wishlistRepo;
    }
    async handle(command) {
        const { clientId, eventId } = command;
        if (!eventId)
            throw new errors_1.BadRequestError('Event ID is required');
        const removed = await this.wishlistRepo.remove(clientId, eventId);
        return { success: removed };
    }
}
exports.RemoveFromWishlistCommandHandler = RemoveFromWishlistCommandHandler;
// 3. Get User Wishlist
class GetUserWishlistQuery {
    clientId;
    __tag = 'GetUserWishlistQuery';
    constructor(clientId) {
        this.clientId = clientId;
    }
}
exports.GetUserWishlistQuery = GetUserWishlistQuery;
class GetUserWishlistQueryHandler {
    wishlistRepo;
    constructor(wishlistRepo) {
        this.wishlistRepo = wishlistRepo;
    }
    async handle(query) {
        const items = await this.wishlistRepo.findByClient(query.clientId);
        return { items, count: items.length };
    }
}
exports.GetUserWishlistQueryHandler = GetUserWishlistQueryHandler;
