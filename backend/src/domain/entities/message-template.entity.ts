import { DeliveryChannel } from '@prisma/client';

export interface MessageTemplate {
  id: string;
  triggerEvent: string;
  channel: DeliveryChannel;
  subject: string | null;
  bodyContent: string;
  variables: any;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
