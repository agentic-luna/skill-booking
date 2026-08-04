import { DeliveryChannel, NotificationStatus } from '@prisma/client';
import { IUserRepository } from '../../../domain/repositories/user.repository';
import { ILedgerRepository } from '../../../domain/repositories/ledger.repository';
import { INotificationRepository } from '../../../domain/repositories/notification.repository';
import { IQueueService } from '../../services/queue.service';
import { ICryptoService } from '../../services/crypto.service';
import { ICommunicationService } from '../../services/communication.service';
import { NotFoundError, BadRequestError } from '../../common/errors';
import { IRequest, IRequestHandler } from '../../common/mediator';
import {
  generateHostPayoutEmailTemplate,
  generateHostPayoutWhatsAppTemplate,
  generateHostPayoutInAppTemplate,
} from '../../../constants/templates';

export class PayoutHostCommand implements IRequest<any> {
  readonly __tag = 'PayoutHostCommand';
  constructor(public readonly hostId: string) {}
}

export class PayoutHostCommandHandler implements IRequestHandler<PayoutHostCommand, any> {
  constructor(
    private userRepo: IUserRepository,
    private ledgerRepo: ILedgerRepository,
    private cryptoService: ICryptoService,
    private commsService: ICommunicationService,
    private notificationRepo?: INotificationRepository,
    private queueService?: IQueueService
  ) {}

  async handle(command: PayoutHostCommand): Promise<any> {
    const { hostId } = command;

    const hostProfile = await this.userRepo.findHostProfileByUserId(hostId);
    if (!hostProfile) {
      throw new NotFoundError('Host profile not found');
    }

    const bankDetail = await this.userRepo.findHostBankDetail(hostProfile.id);
    if (!bankDetail) {
      throw new BadRequestError('Host bank details are missing');
    }

    const ledgers = await this.ledgerRepo.findPendingHostPayouts(hostProfile.id);
    if (ledgers.length === 0) {
      return { success: false, message: 'No pending escrow payouts found for this Host' };
    }

    const decryptedHolderName = this.cryptoService.decrypt(bankDetail.accountHolderName);
    const decryptedAccountNumber = this.cryptoService.decrypt(bankDetail.accountNumber);
    const decryptedIfscCode = this.cryptoService.decrypt(bankDetail.ifscCode);

    const totalPayout = ledgers.reduce((acc, l) => acc + Number(l.hostLiability), 0);

    const payoutResult = await this.commsService.transferPayout(
      {
        accountHolderName: decryptedHolderName,
        accountNumber: decryptedAccountNumber,
        ifscCode: decryptedIfscCode,
        bankName: bankDetail.bankName,
      },
      totalPayout
    );

    if (payoutResult.success) {
      const ledgerIds = ledgers.map((l) => l.id);
      await this.ledgerRepo.updateMany(ledgerIds, { status: 'RELEASED_TO_HOST' });

      // Dispatch payout notifications to host
      try {
        const hostUser = await this.userRepo.findById(hostId);
        if (hostUser && this.notificationRepo && this.queueService) {
          const hostName = `${hostUser.firstName} ${hostUser.lastName}`;
          const payoutData = {
            hostName,
            amount: totalPayout,
            payoutId: payoutResult.payoutId,
            transactionsPaid: ledgerIds.length,
            bankName: bankDetail.bankName,
          };

          const emailContent = generateHostPayoutEmailTemplate(payoutData);
          const whatsappContent = generateHostPayoutWhatsAppTemplate(payoutData);
          const inAppContent = generateHostPayoutInAppTemplate(payoutData);

          const notificationTargets: { channel: DeliveryChannel; recipient: string; content: string }[] = [];

          notificationTargets.push({
            channel: DeliveryChannel.IN_APP,
            recipient: hostUser.email || hostUser.id,
            content: inAppContent,
          });

          if (hostUser.email) {
            notificationTargets.push({
              channel: DeliveryChannel.EMAIL,
              recipient: hostUser.email,
              content: emailContent,
            });
          }

          if (hostUser.phone) {
            notificationTargets.push({
              channel: DeliveryChannel.WHATSAPP,
              recipient: hostUser.phone,
              content: whatsappContent,
            });
          }

          for (const target of notificationTargets) {
            const log = await this.notificationRepo.create({
              userId: hostUser.id,
              channel: target.channel,
              triggerEvent: 'HOST_PAYOUT_RELEASED' as any,
              recipient: target.recipient,
              content: target.content,
              status: target.channel === DeliveryChannel.IN_APP ? NotificationStatus.SENT : NotificationStatus.PENDING,
              sentAt: target.channel === DeliveryChannel.IN_APP ? new Date() : null,
            });

            if (target.channel !== DeliveryChannel.IN_APP) {
              await this.queueService.addNotificationJob(log.id);
            }
          }
        }
      } catch (err) {
        // Silent catch for notification dispatch failures
      }

      return {
        success: true,
        amount: totalPayout,
        payoutId: payoutResult.payoutId,
        transactionsPaid: ledgerIds.length,
      };
    } else {
      const err = new Error('Razorpay Payout API call failed') as any;
      err.statusCode = 502;
      throw err;
    }
  }
}
