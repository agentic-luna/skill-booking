import { Request, Response, NextFunction } from 'express';
import { mediator, configRepo, cacheService, notificationRepo, eventRepo, logger } from '../di-container';
import { GetConfigsQuery } from '../../application/use-cases/admin/get-configs';
import { UpdateConfigCommand } from '../../application/use-cases/admin/update-config';
import { GetTemplatesQuery } from '../../application/use-cases/admin/get-templates';
import { UpdateTemplateCommand } from '../../application/use-cases/admin/update-template';
import { BroadcastNotificationCommand } from '../../application/use-cases/admin/broadcast-notification';
import { GetLedgerQuery } from '../../application/use-cases/admin/get-ledger';
import { PayoutHostCommand } from '../../application/use-cases/admin/payout-host';
import { ApproveEventCommand } from '../../application/use-cases/events/approve-event';
import { AuthenticatedRequest } from '../middleware/auth';
import { getIO } from '../../config/socket';
import { ApiResponse } from '../common/api-response';
import { BadRequestError } from '../common/errors';

export class AdminController {
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
}
