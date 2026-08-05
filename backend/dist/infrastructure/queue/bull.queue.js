"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startNotificationWorker = exports.BullQueueService = exports.notificationQueue = void 0;
const bullmq_1 = require("bullmq");
const url_1 = require("url");
const client_1 = require("@prisma/client");
const environment_1 = require("../../config/environment");
const di_container_1 = require("../../api/di-container");
// Parse Redis connection details from REDIS_URL to avoid TS type mismatches
const parsedRedisUrl = new url_1.URL(environment_1.env.REDIS_URL);
const connectionOptions = {
    host: parsedRedisUrl.hostname || '127.0.0.1',
    port: parsedRedisUrl.port ? parseInt(parsedRedisUrl.port, 10) : 6379,
    username: parsedRedisUrl.username || undefined,
    password: parsedRedisUrl.password || undefined,
};
exports.notificationQueue = new bullmq_1.Queue('notification-queue', {
    connection: connectionOptions,
});
class BullQueueService {
    async addNotificationJob(notificationLogId) {
        await exports.notificationQueue.add('dispatch_notification', { notificationLogId });
    }
}
exports.BullQueueService = BullQueueService;
// Background Worker Process using clean dependency injection
const startNotificationWorker = (notificationRepo, commsService) => {
    const worker = new bullmq_1.Worker('notification-queue', async (job) => {
        const { notificationLogId } = job.data;
        di_container_1.logger.info(`[BullMQ Clean] Processing job ${job.id} for NotificationLog: ${notificationLogId}`);
        const log = await notificationRepo.findById(notificationLogId);
        if (!log) {
            throw new Error(`NotificationLog with ID ${notificationLogId} not found`);
        }
        try {
            let success = false;
            let subject = log.triggerEvent || 'Notification';
            if (log.triggerEvent === client_1.TriggerEvent.TICKET_DELIVERY || log.triggerEvent === 'TICKET_DELIVERY') {
                subject = '🎫 Your Ticket & Booking Confirmation — BookMyTraining';
            }
            else if (log.triggerEvent === client_1.TriggerEvent.BOOKING_CONFIRMED || log.triggerEvent === 'BOOKING_CONFIRMED') {
                subject = '🎉 Booking Confirmed — BookMyTraining';
            }
            else if (log.triggerEvent === client_1.TriggerEvent.BOOKING_CANCELLED || log.triggerEvent === 'BOOKING_CANCELLED') {
                subject = '❌ Booking Cancelled — BookMyTraining';
            }
            else if (log.triggerEvent === client_1.TriggerEvent.EVENT_APPROVED || log.triggerEvent === 'EVENT_APPROVED') {
                subject = '🎉 Your Event Has Been Approved & Is Now Live! — BookMyTraining';
            }
            else if (log.triggerEvent === 'EDIT_REQUEST_APPROVED') {
                subject = '🎉 Edit Request Approved — BookMyTraining';
            }
            switch (log.channel) {
                case client_1.DeliveryChannel.EMAIL:
                    success = await commsService.sendEmail(log.recipient, subject, log.content);
                    break;
                case client_1.DeliveryChannel.SMS:
                    success = await commsService.sendSMS(log.recipient, log.content);
                    break;
                case client_1.DeliveryChannel.WHATSAPP:
                    success = await commsService.sendWhatsApp(log.recipient, log.content);
                    break;
                case client_1.DeliveryChannel.IN_APP:
                    success = true;
                    break;
                default:
                    throw new Error(`Unsupported channel: ${log.channel}`);
            }
            if (success) {
                await notificationRepo.update(notificationLogId, {
                    status: client_1.NotificationStatus.SENT,
                    sentAt: new Date(),
                });
                di_container_1.logger.info(`[BullMQ Clean] Job ${job.id} dispatched notification successfully.`);
            }
            else {
                throw new Error('Integration client failed.');
            }
        }
        catch (error) {
            di_container_1.logger.error(`[BullMQ Clean] Failed to process notification ${notificationLogId}:`, error);
            await notificationRepo.update(notificationLogId, {
                status: client_1.NotificationStatus.FAILED,
                errorMessage: error.message || 'Unknown error',
            });
            throw error;
        }
    }, { connection: connectionOptions });
    worker.on('completed', (job) => {
        di_container_1.logger.info(`[BullMQ Clean] Completed job: ${job.id}`);
    });
    worker.on('failed', (job, err) => {
        di_container_1.logger.error(`[BullMQ Clean] Failed job: ${job?.id}`, err);
    });
    return worker;
};
exports.startNotificationWorker = startNotificationWorker;
