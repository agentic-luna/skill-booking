import { LedgerTxnType, LedgerStatus } from '@prisma/client';
import { TransactionLedger } from '../../../domain/entities';
import { ILedgerRepository } from '../../../domain/repositories/ledger.repository';
import { prisma } from '../../../config/prisma';

function mapLedger(l: any): any {
  if (!l) return null;
  return {
    ...l,
    amountCaptured: Number(l.amountCaptured),
    platformRevenue: Number(l.platformRevenue),
    hostLiability: Number(l.hostLiability),
    booking: l.booking ? {
      ...l.booking,
      seatCount: Number(l.booking.seatCount),
    } : undefined,
  };
}

export class PrismaLedgerRepository implements ILedgerRepository {
  async create(data: {
    bookingId: string;
    gatewayTxnId: string;
    type: LedgerTxnType;
    amountCaptured: number;
    platformRevenue: number;
    hostLiability: number;
    status?: LedgerStatus;
  }): Promise<TransactionLedger> {
    const created = await prisma.transactionLedger.create({ data });
    return mapLedger(created);
  }

  async update(id: string, data: any): Promise<TransactionLedger> {
    const updated = await prisma.transactionLedger.update({
      where: { id },
      data,
    });
    return mapLedger(updated);
  }

  async updateMany(ids: string[], data: any): Promise<{ count: number }> {
    return prisma.transactionLedger.updateMany({
      where: { id: { in: ids } },
      data,
    });
  }

  async findMany(filters?: any): Promise<TransactionLedger[]> {
    const ledgers = await prisma.transactionLedger.findMany({
      where: filters,
      include: {
        booking: {
          select: {
            seatCount: true,
            eventId: true,
          },
        },
      },
    });
    return ledgers.map(mapLedger);
  }

  async findPendingHostPayouts(hostProfileId: string): Promise<TransactionLedger[]> {
    const ledgers = await prisma.transactionLedger.findMany({
      where: {
        status: LedgerStatus.HELD,
        booking: {
          event: { hostId: hostProfileId },
        },
      },
    });
    return ledgers.map(mapLedger);
  }
}
