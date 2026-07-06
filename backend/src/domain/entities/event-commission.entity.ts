import { CommissionType } from '@prisma/client';

export interface EventCommission {
  id: string;
  eventId: string;
  commissionType: CommissionType;
  platformValue: number;
  createdAt: Date;
  updatedAt: Date;
}
