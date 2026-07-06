import { LedgerTxnType, LedgerStatus } from '@prisma/client';
import { TransactionLedger } from '../entities';

export interface ILedgerRepository {
  create(data: {
    bookingId: string;
    gatewayTxnId: string;
    type: LedgerTxnType;
    amountCaptured: number;
    platformRevenue: number;
    hostLiability: number;
    status?: LedgerStatus;
  }): Promise<TransactionLedger>;
  update(id: string, data: any): Promise<TransactionLedger>;
  updateMany(ids: string[], data: any): Promise<{ count: number }>;
  findMany(filters?: any): Promise<TransactionLedger[]>;
  findPendingHostPayouts(hostProfileId: string): Promise<TransactionLedger[]>;
}
