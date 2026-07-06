import { DeliveryChannel, NotificationStatus } from '@prisma/client';

export interface NotificationLog {
  id: string;
  userId: string;
  channel: DeliveryChannel;
  triggerEvent: string;
  recipient: string;
  content: string;
  status: NotificationStatus;
  errorMessage: string | null;
  sentAt: Date | null;
}
