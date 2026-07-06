export interface IQueueService {
  addNotificationJob(notificationLogId: string): Promise<void>;
}
