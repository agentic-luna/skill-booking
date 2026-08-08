"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayoutHostCommandHandler = exports.PayoutHostCommand = void 0;
const client_1 = require("@prisma/client");
const errors_1 = require("../../common/errors");
const prisma_1 = require("../../../config/prisma");
const templates_1 = require("../../../constants/templates");
class PayoutHostCommand {
    hostId;
    mode;
    manualRef;
    __tag = 'PayoutHostCommand';
    constructor(hostId, mode = 'AUTOMATIC', manualRef) {
        this.hostId = hostId;
        this.mode = mode;
        this.manualRef = manualRef;
    }
}
exports.PayoutHostCommand = PayoutHostCommand;
class PayoutHostCommandHandler {
    userRepo;
    ledgerRepo;
    cryptoService;
    commsService;
    notificationRepo;
    queueService;
    constructor(userRepo, ledgerRepo, cryptoService, commsService, notificationRepo, queueService) {
        this.userRepo = userRepo;
        this.ledgerRepo = ledgerRepo;
        this.cryptoService = cryptoService;
        this.commsService = commsService;
        this.notificationRepo = notificationRepo;
        this.queueService = queueService;
    }
    async handle(command) {
        const { hostId, mode, manualRef } = command;
        const hostProfile = await this.userRepo.findHostProfileByUserId(hostId);
        if (!hostProfile) {
            throw new errors_1.NotFoundError('Host profile not found');
        }
        const bankDetail = await this.userRepo.findHostBankDetail(hostProfile.id);
        if (!bankDetail) {
            throw new errors_1.BadRequestError('Host bank details are missing');
        }
        const ledgers = await this.ledgerRepo.findPendingHostPayouts(hostProfile.id);
        if (ledgers.length === 0) {
            return { success: false, message: 'No pending escrow payouts found for this Host' };
        }
        const totalPayout = ledgers.reduce((acc, l) => acc + Number(l.hostLiability), 0);
        let payoutId = '';
        let isSuccess = false;
        if (mode === 'MANUAL' || manualRef) {
            payoutId = manualRef?.trim() || `MANUAL-${Date.now().toString(36).toUpperCase()}`;
            isSuccess = true;
        }
        else {
            const decryptedHolderName = this.cryptoService.decrypt(bankDetail.accountHolderName);
            const decryptedAccountNumber = this.cryptoService.decrypt(bankDetail.accountNumber);
            const decryptedIfscCode = this.cryptoService.decrypt(bankDetail.ifscCode);
            try {
                const payoutResult = await this.commsService.transferPayout({
                    accountHolderName: decryptedHolderName,
                    accountNumber: decryptedAccountNumber,
                    ifscCode: decryptedIfscCode,
                    bankName: bankDetail.bankName,
                }, totalPayout);
                if (payoutResult && payoutResult.success) {
                    isSuccess = true;
                    payoutId = payoutResult.payoutId || `RZP-${Date.now().toString(36).toUpperCase()}`;
                }
                else {
                    return {
                        success: false,
                        message: payoutResult?.error || 'Razorpay Payout API call failed. You can process a Manual Payout instead.',
                        allowManualFallback: true,
                    };
                }
            }
            catch (err) {
                return {
                    success: false,
                    message: err.message || 'Razorpay Payout API error occurred. You can process a Manual Payout instead.',
                    allowManualFallback: true,
                };
            }
        }
        if (isSuccess) {
            const ledgerIds = ledgers.map((l) => l.id);
            await this.ledgerRepo.updateMany(ledgerIds, { status: 'RELEASED_TO_HOST' });
            // Dispatch payout notifications to host
            try {
                const hostUser = await this.userRepo.findById(hostId);
                if (hostUser && this.notificationRepo && this.queueService) {
                    const hostName = `${hostUser.firstName} ${hostUser.lastName}`;
                    // Resolve event titles for WhatsApp/Comms template
                    let eventTitle = 'BookMyTraining Workshops';
                    try {
                        const firstLedger = ledgers[0];
                        if (firstLedger) {
                            const ledgerWithBooking = await prisma_1.prisma.transactionLedger.findUnique({
                                where: { id: firstLedger.id },
                                include: { booking: { include: { event: true } } }
                            });
                            if (ledgerWithBooking?.booking?.event?.title) {
                                eventTitle = ledgerWithBooking.booking.event.title;
                                if (ledgers.length > 1) {
                                    eventTitle = `${eventTitle} & others`;
                                }
                            }
                        }
                    }
                    catch (dbErr) {
                        // Fail-safe to default if query fails
                    }
                    const payoutData = {
                        hostName,
                        amount: totalPayout,
                        payoutId,
                        transactionsPaid: ledgerIds.length,
                        bankName: bankDetail.bankName,
                        eventTitle,
                    };
                    const emailContent = (0, templates_1.generateHostPayoutEmailTemplate)(payoutData);
                    const whatsappContent = (0, templates_1.generateHostPayoutWhatsAppTemplate)(payoutData);
                    const inAppContent = (0, templates_1.generateHostPayoutInAppTemplate)(payoutData);
                    const notificationTargets = [];
                    notificationTargets.push({
                        channel: client_1.DeliveryChannel.IN_APP,
                        recipient: hostUser.email || hostUser.id,
                        content: inAppContent,
                    });
                    if (hostUser.email) {
                        notificationTargets.push({
                            channel: client_1.DeliveryChannel.EMAIL,
                            recipient: hostUser.email,
                            content: emailContent,
                        });
                    }
                    if (hostUser.phone) {
                        notificationTargets.push({
                            channel: client_1.DeliveryChannel.WHATSAPP,
                            recipient: hostUser.phone,
                            content: whatsappContent,
                        });
                    }
                    for (const target of notificationTargets) {
                        const log = await this.notificationRepo.create({
                            userId: hostUser.id,
                            channel: target.channel,
                            triggerEvent: 'HOST_PAYOUT_RELEASED',
                            recipient: target.recipient,
                            content: target.content,
                            status: target.channel === client_1.DeliveryChannel.IN_APP ? client_1.NotificationStatus.SENT : client_1.NotificationStatus.PENDING,
                            sentAt: target.channel === client_1.DeliveryChannel.IN_APP ? new Date() : null,
                        });
                        if (target.channel !== client_1.DeliveryChannel.IN_APP) {
                            await this.queueService.addNotificationJob(log.id);
                        }
                    }
                }
            }
            catch (err) {
                // Silent catch for notification dispatch failures
            }
            return {
                success: true,
                amount: totalPayout,
                payoutId,
                transactionsPaid: ledgerIds.length,
                mode: mode === 'MANUAL' || manualRef ? 'MANUAL' : 'AUTOMATIC',
            };
        }
        return { success: false, message: 'Payout execution incomplete' };
    }
}
exports.PayoutHostCommandHandler = PayoutHostCommandHandler;
