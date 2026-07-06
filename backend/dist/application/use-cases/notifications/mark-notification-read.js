"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarkNotificationReadCommandHandler = exports.MarkNotificationReadCommand = void 0;
const errors_1 = require("../../common/errors");
class MarkNotificationReadCommand {
    id;
    userId;
    __tag = 'MarkNotificationReadCommand';
    constructor(id, userId) {
        this.id = id;
        this.userId = userId;
    }
}
exports.MarkNotificationReadCommand = MarkNotificationReadCommand;
class MarkNotificationReadCommandHandler {
    notificationRepo;
    constructor(notificationRepo) {
        this.notificationRepo = notificationRepo;
    }
    async handle(command) {
        const { id, userId } = command;
        const log = await this.notificationRepo.findById(id);
        if (!log || log.userId !== userId) {
            throw new errors_1.NotFoundError('Notification log not found or access denied');
        }
        return {
            id,
            status: 'READ_ACKNOWLEDGED',
            success: true,
        };
    }
}
exports.MarkNotificationReadCommandHandler = MarkNotificationReadCommandHandler;
