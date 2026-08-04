"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApproveEventCommandHandler = exports.ApproveEventCommand = void 0;
const client_1 = require("@prisma/client");
const errors_1 = require("../../common/errors");
const commission_parser_1 = require("../../../utils/commission-parser");
class ApproveEventCommand {
    eventId;
    commissionType;
    platformValue;
    __tag = 'ApproveEventCommand';
    constructor(eventId, commissionType, platformValue) {
        this.eventId = eventId;
        this.commissionType = commissionType;
        this.platformValue = platformValue;
    }
}
exports.ApproveEventCommand = ApproveEventCommand;
class ApproveEventCommandHandler {
    eventRepo;
    cacheService;
    configRepo;
    userRepo;
    notificationRepo;
    queueService;
    constructor(eventRepo, cacheService, configRepo, userRepo, notificationRepo, queueService) {
        this.eventRepo = eventRepo;
        this.cacheService = cacheService;
        this.configRepo = configRepo;
        this.userRepo = userRepo;
        this.notificationRepo = notificationRepo;
        this.queueService = queueService;
    }
    async handle(command) {
        const { eventId, commissionType, platformValue } = command;
        const event = await this.eventRepo.findById(eventId);
        if (!event) {
            throw new errors_1.NotFoundError('Event not found');
        }
        let finalType;
        let finalValue;
        if (commissionType && platformValue !== undefined && platformValue !== null && !isNaN(platformValue)) {
            finalType = commissionType;
            finalValue = platformValue;
        }
        else {
            try {
                const setting = await this.configRepo.findPlatformSetting('commissionRate');
                const parsed = (0, commission_parser_1.parseCommissionRate)(setting?.value);
                finalType = parsed.commissionType;
                finalValue = parsed.platformValue;
            }
            catch (err) {
                finalType = client_1.CommissionType.PERCENTAGE;
                finalValue = 15;
            }
        }
        const commission = await this.eventRepo.upsertCommission(eventId, finalType, finalValue);
        const updatedEvent = await this.eventRepo.update(eventId, { status: client_1.EventStatus.APPROVED });
        // Trigger notification for event approval
        try {
            const hostProfile = await this.userRepo.findHostProfileById(updatedEvent.hostId);
            if (hostProfile) {
                const hostUser = await this.userRepo.findById(hostProfile.userId);
                if (hostUser) {
                    const templates = await this.configRepo.findTemplates({
                        triggerEvent: client_1.TriggerEvent.EVENT_APPROVED,
                        isActive: true,
                    });
                    for (const temp of templates) {
                        let content = temp.bodyContent;
                        const userName = `${hostUser.firstName} ${hostUser.lastName}`;
                        const replacements = {
                            '{{userName}}': userName,
                            '{{eventTitle}}': updatedEvent.title,
                        };
                        for (const [placeholder, value] of Object.entries(replacements)) {
                            content = content.replace(new RegExp(placeholder, 'g'), value);
                        }
                        const recipient = temp.channel === client_1.DeliveryChannel.EMAIL ? hostUser.email : hostUser.phone;
                        if (recipient) {
                            const log = await this.notificationRepo.create({
                                userId: hostUser.id,
                                channel: temp.channel,
                                triggerEvent: client_1.TriggerEvent.EVENT_APPROVED,
                                recipient,
                                content,
                                status: temp.channel === client_1.DeliveryChannel.IN_APP ? 'SENT' : 'PENDING',
                                sentAt: temp.channel === client_1.DeliveryChannel.IN_APP ? new Date() : null,
                            });
                            if (temp.channel !== client_1.DeliveryChannel.IN_APP) {
                                await this.queueService.addNotificationJob(log.id);
                            }
                        }
                    }
                }
            }
        }
        catch (err) {
            // Silent catch for notification dispatch failures
        }
        // Clear event search cache
        await this.cacheService.delPattern('events:search:*');
        return { event: updatedEvent, commission };
    }
}
exports.ApproveEventCommandHandler = ApproveEventCommandHandler;
