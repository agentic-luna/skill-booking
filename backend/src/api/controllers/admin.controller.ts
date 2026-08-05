import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/prisma';
import { mediator, configRepo, cacheService, notificationRepo, eventRepo, logger, commsService, paymentGatewayProvider, ledgerRepo, queueService } from '../di-container';
import { BookingStatus, LedgerTxnType, LedgerStatus, CommissionType, DeliveryChannel, NotificationStatus } from '@prisma/client';
import { GetConfigsQuery } from '../../application/use-cases/admin/get-configs';
import { UpdateConfigCommand } from '../../application/use-cases/admin/update-config';
import { BroadcastNotificationCommand } from '../../application/use-cases/admin/broadcast-notification';
import { GetLedgerQuery } from '../../application/use-cases/admin/get-ledger';
import { PayoutHostCommand } from '../../application/use-cases/admin/payout-host';
import { AdminLoginCommand } from '../../application/use-cases/admin/admin-login';
import { ApproveEventCommand } from '../../application/use-cases/events/approve-event';
import { GetPendingKycHostsQuery, GetAllHostsQuery, ReviewKycCommand } from '../../application/use-cases/admin/review-kyc';
import { AuthenticatedRequest } from '../middleware/auth';
import { getIO } from '../../config/socket';
import { ApiResponse } from '../common/api-response';
import { BadRequestError } from '../common/errors';
import { parsePaginationParams, buildPaginatedResponse } from '../common/pagination';
import { NodeCryptoService } from '../../infrastructure/security/node.crypto';

const cryptoService = new NodeCryptoService();
import {
  generateEditRequestApprovedEmailTemplate,
  generateEditRequestApprovedWhatsAppTemplate,
  generateEditRequestApprovedInAppTemplate,
  generateEventDeclineEmailTemplate,
  generateEventDeclineWhatsAppTemplate,
  generateEventDeclineInAppTemplate,
  generateRefundApprovedEmailTemplate,
  generateRefundApprovedWhatsAppTemplate,
  generateRefundApprovedInAppTemplate,
  generateRefundDeclinedEmailTemplate,
  generateRefundDeclinedWhatsAppTemplate,
  generateRefundDeclinedInAppTemplate,
} from '../../constants/templates';

export class AdminController {
  static async adminLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const { identifier, email, username, password } = req.body;
      const adminIdentifier = identifier || email || username;
      const result = await mediator.send(new AdminLoginCommand(adminIdentifier, password, req.ip));
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }
  static async getIntegrationConfigs(req: Request, res: Response, next: NextFunction) {
    try {
      const configs = await mediator.send(new GetConfigsQuery());
      return ApiResponse.success(res, configs);
    } catch (error) {
      next(error);
    }
  }

  static async updateIntegrationConfig(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { serviceName } = req.params;
      const { environment, credentials, isActive } = req.body;
      const updated = await mediator.send(new UpdateConfigCommand(
        serviceName as any,
        environment,
        credentials,
        isActive,
        req.user!.id
      ));
      return ApiResponse.success(res, updated);
    } catch (error) {
      next(error);
    }
  }

  static async getPlatformSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const settings = await configRepo.findAllPlatformSettings();
      return ApiResponse.success(res, settings);
    } catch (error) {
      next(error);
    }
  }

  static async updatePlatformSetting(req: Request, res: Response, next: NextFunction) {
    try {
      const { key, value } = req.body;
      if (!key || value === undefined) {
        throw new BadRequestError('Missing key and value parameter');
      }

      const setting = await configRepo.upsertPlatformSetting(key, value);
      await cacheService.del(`configs:platform:${key}`);

      return ApiResponse.success(res, setting);
    } catch (error) {
      next(error);
    }
  }

  static async getNotificationLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, skip } = parsePaginationParams(req.query, 20);
      const status = req.query.status as any;
      const filters = status ? { status } : {};

      const [logs, total] = await Promise.all([
        notificationRepo.findMany(filters, skip, limit),
        notificationRepo.count(filters),
      ]);

      const paginated = buildPaginatedResponse(logs, total, page, limit);

      return ApiResponse.success(res, {
        logs: paginated.data,
        total: paginated.pagination.total,
        page: paginated.pagination.page,
        limit: paginated.pagination.limit,
        totalPages: paginated.pagination.totalPages,
        pagination: paginated.pagination,
      });
    } catch (error) {
      next(error);
    }
  } 

  static async broadcastNotification(req: Request, res: Response, next: NextFunction) {
    try {
      const { channel, cohort, targetUserId, triggerEvent, subject, bodyContent } = req.body;
      const result = await mediator.send(new BroadcastNotificationCommand(
        channel,
        cohort,
        targetUserId,
        triggerEvent || 'BROADCAST',
        subject,
        bodyContent
      ));
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  static async getEventQueue(req: Request, res: Response, next: NextFunction) {
    try {
      const queue = await eventRepo.findPendingEvents();
      return ApiResponse.success(res, queue);
    } catch (error) {
      next(error);
    }
  }

  static async approveEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const { eventId } = req.params;
      const { commissionType, platformValue } = req.body;
      const result = (await mediator.send(new ApproveEventCommand(
        eventId,
        commissionType,
        Number(platformValue)
      ))) as any;

      try {
        getIO().emit('event_approved', {
          id: result.event.id,
          title: result.event.title,
          startTime: result.event.startTime,
        });
      } catch (e) {
        logger.warn('[Socket] Failed to broadcast event approval:', e);
      }

      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  static async getFinanceLedger(req: Request, res: Response, next: NextFunction) {
    try {
      const ledger = await mediator.send(new GetLedgerQuery());
      return ApiResponse.success(res, ledger);
    } catch (error) {
      next(error);
    }
  }

  static async payoutHost(req: Request, res: Response, next: NextFunction) {
    try {
      const { hostId } = req.params;
      const { mode, manualRef } = req.body || {};
      const result = await mediator.send(new PayoutHostCommand(hostId, mode, manualRef));
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  static async getEventPayouts(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, skip } = parsePaginationParams(req.query, 10);
      const payoutFilter = (req.query.payoutStatus as string) || 'ALL';
      const eventStatusFilter = (req.query.eventStatus as string) || 'ALL';
      const search = (req.query.search as string || '').toLowerCase().trim();

      const events = await prisma.event.findMany({
        orderBy: { startTime: 'desc' },
        include: {
          host: {
            include: {
              user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
              bankDetail: true,
            },
          },
          bookings: {
            include: {
              transactionLedger: true,
            },
          },
          commission: true,
        },
      });

      const now = new Date();

      const mappedEvents = events.map((event) => {
        const hostUser = event.host?.user;
        const bankDetail = event.host?.bankDetail;

        let bank: any = null;
        if (bankDetail) {
          try {
            bank = {
              bankName: bankDetail.bankName,
              accountHolderName: cryptoService.decrypt(bankDetail.accountHolderName),
              accountNumber: cryptoService.decrypt(bankDetail.accountNumber),
              ifscCode: cryptoService.decrypt(bankDetail.ifscCode),
              upiId: bankDetail.upiId ? cryptoService.decrypt(bankDetail.upiId) : null,
            };
          } catch {
            bank = {
              bankName: bankDetail.bankName,
              accountHolderName: bankDetail.accountHolderName,
              accountNumber: bankDetail.accountNumber,
              ifscCode: bankDetail.ifscCode,
              upiId: bankDetail.upiId,
            };
          }
        }

        let totalBookings = 0;
        let totalRevenue = 0;
        let platformRevenue = 0;
        let hostPayableAmount = 0;
        let hasHeldLedgers = false;
        let hasReleasedLedgers = false;

        event.bookings.forEach((bk) => {
          if (bk.status !== BookingStatus.CANCELED && bk.status !== BookingStatus.REFUNDED) {
            totalBookings += bk.seatCount || 1;
          }

          bk.transactionLedger.forEach((ledger) => {
            if (ledger.type === 'PAYMENT_CAPTURE') {
              totalRevenue += Number(ledger.amountCaptured);
              platformRevenue += Number(ledger.platformRevenue);
              hostPayableAmount += Number(ledger.hostLiability);

              if (ledger.status === 'HELD') {
                hasHeldLedgers = true;
              }
              if (ledger.status === 'RELEASED_TO_HOST') {
                hasReleasedLedgers = true;
              }
            }
          });
        });

        const isCompleted = new Date(event.startTime) < now;
        const payoutStatus = hasHeldLedgers ? 'PENDING' : hasReleasedLedgers ? 'RELEASED_TO_HOST' : 'PENDING';

        return {
          id: event.id,
          eventId: event.id,
          eventTitle: event.title,
          posterUrl: event.posterUrl,
          mode: event.mode,
          startTime: event.startTime,
          isCompleted,
          eventStatus: isCompleted ? 'COMPLETED' : 'UPCOMING',
          hostId: event.hostId,
          hostUserId: hostUser?.id || '',
          hostName: hostUser ? `${hostUser.firstName || ''} ${hostUser.lastName || ''}`.trim() : 'Instructor Host',
          hostEmail: hostUser?.email || '',
          hostPhone: hostUser?.phone || '',
          kycStatus: event.host?.kycStatus || 'PENDING',
          bankDetail: bank,
          totalBookings,
          totalRevenue,
          platformRevenue,
          hostPayableAmount,
          payoutStatus,
        };
      });

      let filtered = mappedEvents.filter((item) => {
        if (payoutFilter !== 'ALL' && item.payoutStatus !== payoutFilter) return false;
        if (eventStatusFilter !== 'ALL' && item.eventStatus !== eventStatusFilter) return false;
        if (search) {
          const matchTitle = item.eventTitle.toLowerCase().includes(search);
          const matchHost = item.hostName.toLowerCase().includes(search);
          const matchEmail = item.hostEmail.toLowerCase().includes(search);
          if (!matchTitle && !matchHost && !matchEmail) return false;
        }
        return true;
      });

      const total = filtered.length;
      const paginatedList = filtered.slice(skip, skip + limit);
      const result = buildPaginatedResponse(paginatedList, total, page, limit);

      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  static async payoutEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const { eventId } = req.params;
      const { mode, manualRef } = req.body || {};

      const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: {
          host: {
            include: {
              user: true,
              bankDetail: true,
            },
          },
          bookings: {
            include: {
              transactionLedger: true,
            },
          },
        },
      });

      if (!event) {
        throw new BadRequestError('Event not found');
      }

      const heldLedgers: any[] = [];
      event.bookings.forEach((bk) => {
        bk.transactionLedger.forEach((l) => {
          if (l.type === 'PAYMENT_CAPTURE' && l.status === 'HELD') {
            heldLedgers.push(l);
          }
        });
      });

      if (heldLedgers.length === 0) {
        return ApiResponse.success(res, {
          success: false,
          message: 'No pending escrow payouts found for this event.',
        });
      }

      const totalPayout = heldLedgers.reduce((acc, l) => acc + Number(l.hostLiability), 0);
      const payoutId = manualRef?.trim() || `MANUAL-EVT-${Date.now().toString(36).toUpperCase()}`;

      const ledgerIds = heldLedgers.map((l) => l.id);
      await prisma.transactionLedger.updateMany({
        where: { id: { in: ledgerIds } },
        data: { status: 'RELEASED_TO_HOST' },
      });

      return ApiResponse.success(res, {
        success: true,
        amount: totalPayout,
        payoutId,
        transactionsPaid: ledgerIds.length,
        eventTitle: event.title,
        mode: mode === 'MANUAL' || manualRef ? 'MANUAL' : 'AUTOMATIC',
      });
    } catch (error) {
      next(error);
    }
  }

  static async getPendingKycHosts(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await mediator.send(new GetPendingKycHostsQuery());
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  static async getAllHosts(req: Request, res: Response, next: NextFunction) {
    try {
      const { kycStatus } = req.query as { kycStatus?: 'PENDING' | 'APPROVED' | 'REJECTED' };
      const { page, limit } = parsePaginationParams(req.query, 10);
      const result = await mediator.send(new GetAllHostsQuery(kycStatus, page, limit));
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  static async reviewKyc(req: Request, res: Response, next: NextFunction) {
    try {
      const { hostProfileId } = req.params;
      const { decision, rejectionReason } = req.body;
      const result = await mediator.send(new ReviewKycCommand(
        hostProfileId,
        decision,
        rejectionReason
      ));
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  static async getRefundRequests(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, skip } = parsePaginationParams(req.query, 10);

      const [refundRequests, total] = await Promise.all([
        prisma.refundRequest.findMany({
          skip,
          take: limit,
          include: {
            booking: {
              include: {
                client: true,
                event: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.refundRequest.count(),
      ]);

      const mapped = refundRequests.map((r) => ({
        id: r.id,
        clientName: `${r.booking.client.firstName} ${r.booking.client.lastName}`,
        email: r.booking.client.email,
        eventTitle: r.booking.event.title,
        bookingRef: r.booking.bookingRef,
        amount: String(r.booking.totalAmount),
        reason: r.reason || '',
        status: r.status,
        dateRequested: r.createdAt.toISOString().split('T')[0],
      }));

      const paginated = buildPaginatedResponse(mapped, total, page, limit);

      return ApiResponse.success(res, paginated);
    } catch (error) {
      next(error);
    }
  }

  static async approveRefundRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { mode, manualRef } = req.body || {};

      const refundRequest = await prisma.refundRequest.findUnique({
        where: { id },
        include: {
          booking: {
            include: {
              event: {
                include: {
                  commission: true,
                },
              },
            },
          },
        },
      });

      if (!refundRequest) {
        throw new BadRequestError('Refund request not found');
      }

      if (refundRequest.status === 'APPROVED') {
        throw new BadRequestError('Refund request is already approved.');
      }

      const booking = refundRequest.booking;
      const event = booking.event;
      const refundAmount = Number(refundRequest.refundAmount) || Number(booking.totalAmount) || 0;

      let refundTxnId = manualRef?.trim() || `MNL-REFUND-${Date.now().toString(36).toUpperCase()}`;

      if (refundAmount > 0) {
        const ledgers = await ledgerRepo.findMany({
          bookingId: booking.id,
          type: LedgerTxnType.PAYMENT_CAPTURE,
        });
        const paymentLedger = ledgers.find((l) => l.status === LedgerStatus.HELD);

        if (mode === 'AUTOMATIC') {
          if (!paymentLedger) {
            return ApiResponse.success(res, {
              success: false,
              message: 'Held payment ledger record not found for automatic refund. Please process using Manual Refund.',
              allowManualFallback: true,
            });
          }

          try {
            const refundResult = await paymentGatewayProvider.initiateRefund(
              paymentLedger.gatewayTxnId,
              refundAmount,
              { bookingId: booking.id, bookingRef: booking.bookingRef }
            );

            if (refundResult && refundResult.refundId) {
              refundTxnId = refundResult.refundId;
            }
          } catch (err: any) {
            return ApiResponse.success(res, {
              success: false,
              message: err.message || 'Razorpay Refund API error. You can process a Manual Refund instead.',
              allowManualFallback: true,
            });
          }
        }

        const commissionPct =
          event.commission?.commissionType === CommissionType.PERCENTAGE
            ? Number(event.commission.platformValue) / 100
            : 0.1; // Default 10%

        const lostHostLiability = refundAmount * (1 - commissionPct);
        const lostPlatformRevenue = refundAmount * commissionPct;

        // Register REFUND ledger log
        await ledgerRepo.create({
          bookingId: booking.id,
          gatewayTxnId: refundTxnId,
          type: LedgerTxnType.REFUND,
          amountCaptured: -refundAmount,
          platformRevenue: -lostPlatformRevenue,
          hostLiability: -lostHostLiability,
          status: LedgerStatus.REFUNDED_TO_CLIENT,
        });

        if (paymentLedger) {
          await ledgerRepo.update(paymentLedger.id, {
            status: LedgerStatus.REFUNDED_TO_CLIENT,
          });
        }
      }

      const [updatedRequest, updatedBooking] = await prisma.$transaction([
        prisma.refundRequest.update({
          where: { id },
          data: { status: 'APPROVED' },
        }),
        prisma.booking.update({
          where: { id: refundRequest.bookingId },
          data: { status: BookingStatus.REFUNDED },
        }),
      ]);

      // Dispatch notifications to client
      try {
        const clientUser = await prisma.user.findUnique({ where: { id: booking.clientId } });
        if (clientUser) {
          const clientName = `${clientUser.firstName} ${clientUser.lastName}`;
          const refundData = {
            clientName,
            bookingId: booking.id,
            eventTitle: event.title,
            refundAmount,
            status: 'APPROVED' as const,
          };

          const emailContent = generateRefundApprovedEmailTemplate(refundData);
          const whatsappContent = generateRefundApprovedWhatsAppTemplate(refundData);
          const inAppContent = generateRefundApprovedInAppTemplate(refundData);

          const notificationTargets: { channel: DeliveryChannel; recipient: string; content: string }[] = [];

          notificationTargets.push({
            channel: DeliveryChannel.IN_APP,
            recipient: clientUser.email || clientUser.id,
            content: inAppContent,
          });

          if (clientUser.email) {
            notificationTargets.push({
              channel: DeliveryChannel.EMAIL,
              recipient: clientUser.email,
              content: emailContent,
            });
          }

          if (clientUser.phone) {
            notificationTargets.push({
              channel: DeliveryChannel.WHATSAPP,
              recipient: clientUser.phone,
              content: whatsappContent,
            });
          }

          for (const target of notificationTargets) {
            const log = await prisma.notificationLog.create({
              data: {
                userId: clientUser.id,
                channel: target.channel,
                triggerEvent: 'REFUND_SUCCESS' as any,
                recipient: target.recipient,
                content: target.content,
                status: target.channel === DeliveryChannel.IN_APP ? NotificationStatus.SENT : NotificationStatus.PENDING,
                sentAt: target.channel === DeliveryChannel.IN_APP ? new Date() : null,
              }
            });

            if (target.channel !== DeliveryChannel.IN_APP) {
              await queueService.addNotificationJob(log.id);
            }
          }
        }
      } catch (err) {
        // Silent catch for notification dispatch errors
      }

      return ApiResponse.success(res, {
        success: true,
        refundRequest: updatedRequest,
        booking: updatedBooking,
        refundTxnId,
        mode: mode === 'MANUAL' || manualRef ? 'MANUAL' : 'AUTOMATIC',
      });
    } catch (error) {
      next(error);
    }
  }

  static async declineRefundRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const refundRequest = await prisma.refundRequest.findUnique({
        where: { id },
        include: {
          booking: {
            include: {
              event: true,
            }
          }
        }
      });

      const updated = await prisma.refundRequest.update({
        where: { id },
        data: { status: 'DECLINED' },
      });

      // Dispatch notifications to client
      if (refundRequest?.booking) {
        try {
          const booking = refundRequest.booking;
          const clientUser = await prisma.user.findUnique({ where: { id: booking.clientId } });

          if (clientUser) {
            const clientName = `${clientUser.firstName} ${clientUser.lastName}`;
            const refundData = {
              clientName,
              bookingId: booking.id,
              eventTitle: booking.event?.title || 'Training Workshop',
              status: 'DECLINED' as const,
              reason,
            };

            const emailContent = generateRefundDeclinedEmailTemplate(refundData);
            const whatsappContent = generateRefundDeclinedWhatsAppTemplate(refundData);
            const inAppContent = generateRefundDeclinedInAppTemplate(refundData);

            const notificationTargets: { channel: DeliveryChannel; recipient: string; content: string }[] = [];

            notificationTargets.push({
              channel: DeliveryChannel.IN_APP,
              recipient: clientUser.email || clientUser.id,
              content: inAppContent,
            });

            if (clientUser.email) {
              notificationTargets.push({
                channel: DeliveryChannel.EMAIL,
                recipient: clientUser.email,
                content: emailContent,
              });
            }

            if (clientUser.phone) {
              notificationTargets.push({
                channel: DeliveryChannel.WHATSAPP,
                recipient: clientUser.phone,
                content: whatsappContent,
              });
            }

            for (const target of notificationTargets) {
              const log = await prisma.notificationLog.create({
                data: {
                  userId: clientUser.id,
                  channel: target.channel,
                  triggerEvent: 'REFUND_DECLINED' as any,
                  recipient: target.recipient,
                  content: target.content,
                  status: target.channel === DeliveryChannel.IN_APP ? NotificationStatus.SENT : NotificationStatus.PENDING,
                  sentAt: target.channel === DeliveryChannel.IN_APP ? new Date() : null,
                }
              });

              if (target.channel !== DeliveryChannel.IN_APP) {
                await queueService.addNotificationJob(log.id);
              }
            }
          }
        } catch (err) {
          // Silent catch for notification dispatch errors
        }
      }

      return ApiResponse.success(res, {
        message: 'Refund request declined successfully',
        refundRequest: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteHost(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updatedUser = await prisma.user.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
      return ApiResponse.success(res, {
        message: 'Host soft-deleted successfully',
        user: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  }

  static async notifyHost(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { subject, bodyContent } = req.body;
      if (!subject || !bodyContent) {
        throw new BadRequestError('Subject and message content are required');
      }

      const host = await prisma.user.findUnique({ where: { id } });
      if (!host || !host.email) {
        throw new BadRequestError('Host not found or host does not have an email address');
      }

      const log = await prisma.notificationLog.create({
        data: {
          userId: host.id,
          channel: 'EMAIL',
          triggerEvent: 'ADMIN_DIRECT',
          recipient: host.email,
          content: bodyContent,
          status: 'PENDING',
        },
      });

      try {
        await commsService.sendEmail(host.email, subject, bodyContent);
        await prisma.notificationLog.update({
          where: { id: log.id },
          data: { status: 'SENT', sentAt: new Date() },
        });
      } catch (err: any) {
        await prisma.notificationLog.update({
          where: { id: log.id },
          data: { status: 'FAILED', errorMessage: err.message },
        });
        logger.error(`[AdminNotify] Failed to dispatch email to host ${host.email}:`, err);
      }

      return ApiResponse.success(res, {
        message: 'Notification sent successfully',
        log,
      });
    } catch (error) {
      next(error);
    }
  }

  static async declineEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const { eventId } = req.params;
      const { reason } = req.body;

      const updatedEvent = await prisma.event.update({
        where: { id: eventId },
        data: { status: 'CANCELED' },
        include: {
          host: {
            include: { user: true }
          }
        }
      });

      // Dispatch notifications to host
      if (updatedEvent.host?.user) {
        try {
          const hostUser = updatedEvent.host.user;
          const hostName = `${hostUser.firstName} ${hostUser.lastName}`;
          const declineData = { hostName, eventTitle: updatedEvent.title, reason };

          const emailContent = generateEventDeclineEmailTemplate(declineData);
          const whatsappContent = generateEventDeclineWhatsAppTemplate(declineData);
          const inAppContent = generateEventDeclineInAppTemplate(declineData);

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
            const log = await prisma.notificationLog.create({
              data: {
                userId: hostUser.id,
                channel: target.channel,
                triggerEvent: 'EVENT_DECLINED' as any,
                recipient: target.recipient,
                content: target.content,
                status: target.channel === DeliveryChannel.IN_APP ? NotificationStatus.SENT : NotificationStatus.PENDING,
                sentAt: target.channel === DeliveryChannel.IN_APP ? new Date() : null,
              }
            });

            if (target.channel !== DeliveryChannel.IN_APP) {
              await queueService.addNotificationJob(log.id);
            }
          }
        } catch (err) {
          // Silent catch for notification dispatch errors
        }
      }

      return ApiResponse.success(res, {
        message: 'Program listing declined successfully',
        event: updatedEvent,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getEditRequests(req: Request, res: Response, next: NextFunction) {
    try {
      const requests = await prisma.editRequest.findMany({
        where: { status: 'PENDING' },
        include: {
          event: true,
          host: { include: { user: true } }
        },
        orderBy: { createdAt: 'desc' }
      });
      return ApiResponse.success(res, requests);
    } catch (error) {
      next(error);
    }
  }

  static async approveEditRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const editRequest = await prisma.editRequest.findUnique({
        where: { id },
        include: {
          event: true,
          host: {
            include: {
              user: true,
            },
          },
        },
      });

      if (!editRequest || editRequest.status !== 'PENDING') {
        throw new BadRequestError('Invalid or already processed edit request.');
      }

      await prisma.$transaction(async (tx) => {
        // 1. Mark request as APPROVED
        await tx.editRequest.update({
          where: { id },
          data: { status: 'APPROVED' },
        });

        // 2. Change Event status to EDIT_MODE so host can edit it
        await tx.event.update({
          where: { id: editRequest.eventId },
          data: { status: 'EDIT_MODE' },
        });
      });

      // 3. Dispatch Email & WhatsApp notification to host
      try {
        const hostUser = editRequest.host?.user;
        const event = editRequest.event;

        if (hostUser && event) {
          const hostName = `${hostUser.firstName} ${hostUser.lastName}`;
          const approveData = {
            hostName,
            eventTitle: event.title,
            eventId: event.id,
          };

          const emailContent = generateEditRequestApprovedEmailTemplate(approveData);
          const whatsappContent = generateEditRequestApprovedWhatsAppTemplate(approveData);
          const inAppContent = generateEditRequestApprovedInAppTemplate(approveData);

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
            const log = await notificationRepo.create({
              userId: hostUser.id,
              channel: target.channel,
              triggerEvent: 'EDIT_REQUEST_APPROVED' as any,
              recipient: target.recipient,
              content: target.content,
              status: target.channel === DeliveryChannel.IN_APP ? NotificationStatus.SENT : NotificationStatus.PENDING,
              sentAt: target.channel === DeliveryChannel.IN_APP ? new Date() : null,
            });

            if (target.channel !== DeliveryChannel.IN_APP) {
              await queueService.addNotificationJob(log.id);
            }
          }
        }
      } catch (err) {
        logger.error('[AdminController] Failed to dispatch edit request approval notification:', err);
      }

      return ApiResponse.success(res, { message: 'Edit request approved. Event is now unlocked.' });
    } catch (error) {
      next(error);
    }
  }

  static async rejectEditRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const editRequest = await prisma.editRequest.findUnique({ where: { id } });
      
      if (!editRequest || editRequest.status !== 'PENDING') {
        throw new BadRequestError('Invalid or already processed edit request.');
      }

      await prisma.editRequest.update({
        where: { id },
        data: { status: 'REJECTED' }
      });

      return ApiResponse.success(res, { message: 'Edit request rejected.' });
    } catch (error) {
      next(error);
    }
  }
}

