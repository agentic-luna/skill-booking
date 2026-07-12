import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/prisma';
import { mediator, configRepo, cacheService, notificationRepo, eventRepo, logger, commsService } from '../di-container';
import { GetConfigsQuery } from '../../application/use-cases/admin/get-configs';
import { UpdateConfigCommand } from '../../application/use-cases/admin/update-config';
import { GetTemplatesQuery } from '../../application/use-cases/admin/get-templates';
import { UpdateTemplateCommand } from '../../application/use-cases/admin/update-template';
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

  static async getMessageTemplates(req: Request, res: Response, next: NextFunction) {
    try {
      const templates = await mediator.send(new GetTemplatesQuery());
      return ApiResponse.success(res, templates);
    } catch (error) {
      next(error);
    }
  }

  static async updateMessageTemplate(req: Request, res: Response, next: NextFunction) {
    try {
      const { templateId } = req.params;
      const { bodyContent, variables, isActive, subject } = req.body;
      const updated = await mediator.send(new UpdateTemplateCommand(templateId, {
        bodyContent,
        variables,
        isActive,
        subject,
      }));
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
      const page = parseInt((req.query.page as string) || '1', 10);
      const limit = parseInt((req.query.limit as string) || '20', 10);
      const status = req.query.status as any;

      const skip = (page - 1) * limit;
      const filters = status ? { status } : {};

      const [logs, total] = await Promise.all([
        notificationRepo.findMany(filters, skip, limit),
        notificationRepo.count(filters),
      ]);

      return ApiResponse.success(res, {
        logs,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
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
      const result = await mediator.send(new PayoutHostCommand(hostId));
      return ApiResponse.success(res, result);
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
      const result = await mediator.send(new GetAllHostsQuery(kycStatus));
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
      const refundRequests = await prisma.refundRequest.findMany({
        include: {
          booking: {
            include: {
              client: true,
              event: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

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

      return ApiResponse.success(res, mapped);
    } catch (error) {
      next(error);
    }
  }

  static async approveRefundRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const refundRequest = await prisma.refundRequest.findUnique({
        where: { id },
        include: { booking: true },
      });
      if (!refundRequest) {
        throw new BadRequestError('Refund request not found');
      }

      const [updatedRequest, updatedBooking] = await prisma.$transaction([
        prisma.refundRequest.update({
          where: { id },
          data: { status: 'APPROVED' },
        }),
        prisma.booking.update({
          where: { id: refundRequest.bookingId },
          data: { status: 'REFUNDED' },
        }),
        prisma.transactionLedger.updateMany({
          where: { bookingId: refundRequest.bookingId },
          data: { status: 'REFUNDED_TO_CLIENT' },
        }),
      ]);

      return ApiResponse.success(res, {
        message: 'Refund request approved successfully',
        refundRequest: updatedRequest,
        booking: updatedBooking,
      });
    } catch (error) {
      next(error);
    }
  }

  static async declineRefundRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updated = await prisma.refundRequest.update({
        where: { id },
        data: { status: 'DECLINED' },
      });
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
      if (!host) {
        throw new BadRequestError('Host not found');
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
      const updatedEvent = await prisma.event.update({
        where: { id: eventId },
        data: { status: 'CANCELED' },
      });
      return ApiResponse.success(res, {
        message: 'Program listing declined successfully',
        event: updatedEvent,
      });
    } catch (error) {
      next(error);
    }
  }
}
