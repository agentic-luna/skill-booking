"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApproveEventCommandHandler = exports.ApproveEventCommand = void 0;
const client_1 = require("@prisma/client");
const errors_1 = require("../../common/errors");
const commission_parser_1 = require("../../../utils/commission-parser");
const templates_1 = require("../../../constants/templates");
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
                    const hostName = `${hostUser.firstName} ${hostUser.lastName}`;
                    const formattedStartTime = new Date(updatedEvent.startTime).toLocaleString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                    });
                    const approveData = {
                        hostName,
                        eventTitle: updatedEvent.title,
                        eventId: updatedEvent.id,
                        category: updatedEvent.category || 'Workshop',
                        mode: updatedEvent.mode,
                        price: Number(updatedEvent.price || 0),
                        totalSeats: Number(updatedEvent.totalSeats),
                        commissionType: commission.commissionType,
                        commissionValue: Number(commission.platformValue),
                        formattedStartTime,
                    };
                    const emailContent = (0, templates_1.generateApproveEventEmailTemplate)(approveData);
                    const whatsappContent = (0, templates_1.generateApproveEventWhatsAppTemplate)(approveData);
                    const inAppContent = (0, templates_1.generateApproveEventInAppTemplate)(approveData);
                    const notificationTargets = [];
                    notificationTargets.push({
                        channel: client_1.DeliveryChannel.IN_APP,
                        recipient: hostUser.email || hostUser.id,
                        content: inAppContent,
                    });
                    if (hostUser.email) {
                        notificationTargets.push({
                            channel: client_1.DeliveryChannel.EMAIL,
                            recipient: hostUser.email,
                            content: emailContent,
                        });
                    }
                    if (hostUser.phone) {
                        notificationTargets.push({
                            channel: client_1.DeliveryChannel.WHATSAPP,
                            recipient: hostUser.phone,
                            content: whatsappContent,
                        });
                    }
                    for (const target of notificationTargets) {
                        const log = await this.notificationRepo.create({
                            userId: hostUser.id,
                            channel: target.channel,
                            triggerEvent: client_1.TriggerEvent.EVENT_APPROVED,
                            recipient: target.recipient,
                            content: target.content,
                            status: target.channel === client_1.DeliveryChannel.IN_APP ? client_1.NotificationStatus.SENT : client_1.NotificationStatus.PENDING,
                            sentAt: target.channel === client_1.DeliveryChannel.IN_APP ? new Date() : null,
                        });
                        if (target.channel !== client_1.DeliveryChannel.IN_APP) {
                            await this.queueService.addNotificationJob(log.id);
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
