import { ILedgerRepository } from '../../../domain/repositories/ledger.repository';
import { IRequest, IRequestHandler } from '../../common/mediator';

export class GetLedgerQuery implements IRequest<any> {
  readonly __tag = 'GetLedgerQuery';
}

export class GetLedgerQueryHandler implements IRequestHandler<GetLedgerQuery, any> {
  constructor(private ledgerRepo: ILedgerRepository) {}

  async handle(query: GetLedgerQuery): Promise<any> {
    const allLedgers = await this.ledgerRepo.findMany();

    let totalEscrowLiabilities = 0;
    let totalRealizedRevenue = 0;
    let totalRefunded = 0;

    allLedgers.forEach((l) => {
      if (l.type === 'PAYMENT_CAPTURE') {
        if (l.status === 'HELD') {
          totalEscrowLiabilities += Number(l.hostLiability);
        } else if (l.status === 'RELEASED_TO_HOST') {
          totalRealizedRevenue += Number(l.platformRevenue);
        }
      } else if (l.type === 'REFUND') {
        totalRefunded += Number(l.amountCaptured);
      }
    });

    return {
      totalEscrowLiabilities,
      totalRealizedRevenue,
      totalRefunded,
      ledgerCount: allLedgers.length,
    };
  }
}
