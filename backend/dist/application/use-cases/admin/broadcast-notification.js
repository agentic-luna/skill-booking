"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BroadcastNotificationCommandHandler = exports.BroadcastNotificationCommand = void 0;
const client_1 = require("@prisma/client");
class BroadcastNotificationCommand {
    channel;
    cohort;
    targetUserId;
    triggerEvent;
    subject;
    bodyContent;
    __tag = 'BroadcastNotificationCommand';
    constructor(channel, cohort, targetUserId, triggerEvent, subject, bodyContent) {
        this.channel = channel;
        this.cohort = cohort;
        this.targetUserId = targetUserId;
        this.triggerEvent = triggerEvent;
        this.subject = subject;
        this.bodyContent = bodyContent;
    }
}
exports.BroadcastNotificationCommand = BroadcastNotificationCommand;
class BroadcastNotificationCommandHandler {
    notificationRepo;
    userRepo;
    queueService;
    constructor(notificationRepo, userRepo, queueService) {
        this.notificationRepo = notificationRepo;
        this.userRepo = userRepo;
        this.queueService = queueService;
    }
    async handle(command) {
        const { channel, cohort, targetUserId, triggerEvent, subject, bodyContent } = command;
        let users = [];
        if (cohort === 'INDIVIDUAL' && targetUserId) {
            const user = await this.userRepo.findById(targetUserId);
            if (user)
                users.push(user);
        }
        else {
            const roleMap = {
                ALL: undefined,
                HOSTS: client_1.UserRole.HOST,
                CLIENTS: client_1.UserRole.CLIENT,
            };
            const role = roleMap[cohort];
            users = await this.userRepo.findUsers({
                role,
                status: client_1.UserStatus.ACTIVE,
                deletedAt: null,
            });
        }
        const createdLogs = [];
        for (const u of users) {
            const recipient = channel === client_1.DeliveryChannel.EMAIL ? u.email : u.phone;
            const log = await this.notificationRepo.create({
                userId: u.id,
                channel,
                triggerEvent,
                recipient,
                content: bodyContent,
                status: channel === client_1.DeliveryChannel.IN_APP ? client_1.NotificationStatus.SENT : client_1.NotificationStatus.PENDING,
                sentAt: channel === client_1.DeliveryChannel.IN_APP ? new Date() : null,
            });
            createdLogs.push(log);
            if (channel !== client_1.DeliveryChannel.IN_APP) {
                await this.queueService.addNotificationJob(log.id);
            }
        }
        return {
            success: true,
            count: createdLogs.length,
        };
    }
}
exports.BroadcastNotificationCommandHandler = BroadcastNotificationCommandHandler;
