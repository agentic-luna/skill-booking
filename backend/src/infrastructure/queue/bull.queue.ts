import { Queue, Worker, Job } from 'bullmq';
import { URL } from 'url';
import { DeliveryChannel, NotificationStatus } from '@prisma/client';
import { IQueueService } from '../../application/services/queue.service';
import { INotificationRepository } from '../../domain/repositories/notification.repository';
import { ICommunicationService } from '../../application/services/communication.service';
import { env } from '../../config/environment';
import { logger } from '../../api/di-container';

// Parse Redis connection details from REDIS_URL to avoid TS type mismatches
const parsedRedisUrl = new URL(env.REDIS_URL);
const connectionOptions = {
  host: parsedRedisUrl.hostname || '127.0.0.1',
  port: parsedRedisUrl.port ? parseInt(parsedRedisUrl.port, 10) : 6379,
  username: parsedRedisUrl.username || undefined,
  password: parsedRedisUrl.password || undefined,
};

export const notificationQueue = new Queue('notification-queue', {
  connection: connectionOptions,
});

export class BullQueueService implements IQueueService {
  async addNotificationJob(notificationLogId: string): Promise<void> {
    await notificationQueue.add('dispatch_notification', { notificationLogId });
  }
}

// Background Worker Process using clean dependency injection
export const startNotificationWorker = (
  notificationRepo: INotificationRepository,
  commsService: ICommunicationService
) => {
  const worker = new Worker(
    'notification-queue',
    async (job: Job) => {
      const { notificationLogId } = job.data;
      logger.info(`[BullMQ Clean] Processing job ${job.id} for NotificationLog: ${notificationLogId}`);

      const log = await notificationRepo.findById(notificationLogId);
      if (!log) {
        throw new Error(`NotificationLog with ID ${notificationLogId} not found`);
      }

      try {
        let success = false;
        const subject = log.triggerEvent || 'Notification';

        switch (log.channel) {
          case DeliveryChannel.EMAIL:
            success = await commsService.sendEmail(log.recipient, subject, log.content);
            break;
          case DeliveryChannel.SMS:
            success = await commsService.sendSMS(log.recipient, log.content);
            break;
          case DeliveryChannel.WHATSAPP:
            success = await commsService.sendWhatsApp(log.recipient, log.content);
            break;
          case DeliveryChannel.IN_APP:
            success = true;
            break;
          default:
            throw new Error(`Unsupported channel: ${log.channel}`);
        }

        if (success) {
          await notificationRepo.update(notificationLogId, {
            status: NotificationStatus.SENT,
            sentAt: new Date(),
          });
          logger.info(`[BullMQ Clean] Job ${job.id} dispatched notification successfully.`);
        } else {
          throw new Error('Integration client failed.');
        }
      } catch (error: any) {
        logger.error(`[BullMQ Clean] Failed to process notification ${notificationLogId}:`, error);
        await notificationRepo.update(notificationLogId, {
          status: NotificationStatus.FAILED,
          errorMessage: error.message || 'Unknown error',
        });
        throw error;
      }
    },
    { connection: connectionOptions }
  );

  worker.on('completed', (job) => {
    logger.info(`[BullMQ Clean] Completed job: ${job.id}`);
  });

  worker.on('failed', (job, err) => {
    logger.error(`[BullMQ Clean] Failed job: ${job?.id}`, err);
  });

  return worker;
};
