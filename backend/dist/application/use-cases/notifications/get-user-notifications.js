"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetUserNotificationsQueryHandler = exports.GetUserNotificationsQuery = void 0;
const client_1 = require("@prisma/client");
class GetUserNotificationsQuery {
    userId;
    __tag = 'GetUserNotificationsQuery';
    constructor(userId) {
        this.userId = userId;
    }
}
exports.GetUserNotificationsQuery = GetUserNotificationsQuery;
class GetUserNotificationsQueryHandler {
    notificationRepo;
    constructor(notificationRepo) {
        this.notificationRepo = notificationRepo;
    }
    async handle(query) {
        const { userId } = query;
        return this.notificationRepo.findMany({
            userId,
            channel: client_1.DeliveryChannel.IN_APP,
        });
    }
}
exports.GetUserNotificationsQueryHandler = GetUserNotificationsQueryHandler;
