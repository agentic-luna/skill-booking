"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsController = void 0;
const di_container_1 = require("../di-container");
const get_user_notifications_1 = require("../../application/use-cases/notifications/get-user-notifications");
const mark_notification_read_1 = require("../../application/use-cases/notifications/mark-notification-read");
const api_response_1 = require("../common/api-response");
class NotificationsController {
    static async getMyNotifications(req, res, next) {
        try {
            const notifications = await di_container_1.mediator.send(new get_user_notifications_1.GetUserNotificationsQuery(req.user.id));
            return api_response_1.ApiResponse.success(res, notifications);
        }
        catch (error) {
            next(error);
        }
    }
    static async markRead(req, res, next) {
        try {
            const { id } = req.params;
            const result = await di_container_1.mediator.send(new mark_notification_read_1.MarkNotificationReadCommand(id, req.user.id));
            return api_response_1.ApiResponse.success(res, result);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.NotificationsController = NotificationsController;
