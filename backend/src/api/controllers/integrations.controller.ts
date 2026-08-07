import { Response, NextFunction } from 'express';
import { mediator } from '../di-container';
import { AuthenticatedRequest } from '../middleware/auth';
import { ApiResponse } from '../common/api-response';
import { SetupTwilioCommand } from '../../application/use-cases/integrations/setup-twilio';
import { SetupSendgridCommand } from '../../application/use-cases/integrations/setup-sendgrid';
import { SetupMetaWaCommand } from '../../application/use-cases/integrations/setup-meta-wa';
import { SetupRazorpayCommand } from '../../application/use-cases/integrations/setup-razorpay';

export class IntegrationsController {
  static async setupTwilio(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { environment, accountSid, authToken, fromNumber, isActive } = req.body;
      const result = await mediator.send(new SetupTwilioCommand(
        environment,
        accountSid,
        authToken,
        fromNumber,
        isActive ?? true,
        req.user!.id
      ));
      return ApiResponse.success(res, result, 200, 'Twilio configuration updated');
    } catch (error) {
      next(error);
    }
  }

  static async setupSendgrid(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { environment, apiKey, fromEmail, fromName, isActive } = req.body;
      const result = await mediator.send(new SetupSendgridCommand(
        environment,
        apiKey,
        fromEmail,
        fromName,
        isActive ?? true,
        req.user!.id
      ));
      return ApiResponse.success(res, result, 200, 'SendGrid configuration updated');
    } catch (error) {
      next(error);
    }
  }

  static async setupMetaWa(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { environment, accessToken, phoneNumberId, businessAccountId, isActive, verifyToken } = req.body;
      const result = await mediator.send(new SetupMetaWaCommand(
        environment,
        accessToken,
        phoneNumberId,
        businessAccountId,
        isActive ?? true,
        req.user!.id,
        verifyToken
      ));
      return ApiResponse.success(res, result, 200, 'Meta WhatsApp configuration updated');
    } catch (error) {
      next(error);
    }
  }

  static async setupRazorpay(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { environment, keyId, keySecret, webhookSecret, isActive } = req.body;
      const result = await mediator.send(new SetupRazorpayCommand(
        environment,
        keyId,
        keySecret,
        webhookSecret,
        isActive ?? true,
        req.user!.id
      ));
      return ApiResponse.success(res, result, 200, 'Razorpay configuration updated');
    } catch (error) {
      next(error);
    }
  }
}
