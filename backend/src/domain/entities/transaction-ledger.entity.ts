import { LedgerTxnType, LedgerStatus } from '@prisma/client';
import { Booking } from './booking.entity';

export interface TransactionLedger {
  id: string;
  bookingId: string;
  gatewayTxnId: string;
  type: LedgerTxnType;
  amountCaptured: number;
  platformRevenue: number;
  hostLiability: number;
  status: LedgerStatus;
  createdAt: Date;
  updatedAt: Date;
  booking?: Booking;
}
