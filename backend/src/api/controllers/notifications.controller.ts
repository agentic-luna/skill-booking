import { Response, NextFunction } from 'express';
import { mediator } from '../di-container';
import { GetUserNotificationsQuery } from '../../application/use-cases/notifications/get-user-notifications';
import { MarkNotificationReadCommand } from '../../application/use-cases/notifications/mark-notification-read';
import { AuthenticatedRequest } from '../middleware/auth';
import { ApiResponse } from '../common/api-response';

export class NotificationsController {
  static async getMyNotifications(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const notifications = await mediator.send(new GetUserNotificationsQuery(req.user!.id));
      return ApiResponse.success(res, notifications);
    } catch (error) {
      next(error);
    }
  }

  static async markRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await mediator.send(new MarkNotificationReadCommand(id, req.user!.id));
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }
}
