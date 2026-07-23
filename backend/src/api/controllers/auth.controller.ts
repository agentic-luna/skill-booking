import { Request, Response, NextFunction } from 'express';
import { mediator } from '../di-container';
import { SignupCommand } from '../../application/use-cases/auth/signup';
import { LoginCommand } from '../../application/use-cases/auth/login';
import { RefreshTokenCommand } from '../../application/use-cases/auth/refresh';
import { LogoutCommand } from '../../application/use-cases/auth/logout';
import { GetProfileQuery } from '../../application/use-cases/auth/get-profile';
import { SendOtpCommand } from '../../application/use-cases/auth/send-otp';
import { VerifyOtpCommand } from '../../application/use-cases/auth/verify-otp';
import { SendForgotPasswordOtpCommand } from '../../application/use-cases/auth/send-forgot-password-otp';
import { VerifyForgotPasswordOtpCommand } from '../../application/use-cases/auth/verify-forgot-password-otp';
import { ResetPasswordCommand } from '../../application/use-cases/auth/reset-password';
import { ClientSendOtpCommand } from '../../application/use-cases/auth/client/send-otp';
import { ClientVerifyOtpCommand } from '../../application/use-cases/auth/client/verify-otp';
import { ClientSignupCommand } from '../../application/use-cases/auth/client/signup';
import { ClientSendEmailVerificationCommand } from '../../application/use-cases/auth/client/send-email-verification';
import { ClientVerifyEmailMagicLinkCommand } from '../../application/use-cases/auth/client/verify-email-magic-link';
import { AuthenticatedRequest } from '../middleware/auth';
import { ApiResponse } from '../common/api-response';

export class AuthController {
  static async sendOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { target, type } = req.body;
      const result = await mediator.send(new SendOtpCommand(target, type));
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  static async verifyOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { target, type, otp } = req.body;
      const result = await mediator.send(new VerifyOtpCommand(target, type, otp));
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  static async signup(req: Request, res: Response, next: NextFunction) {
    try {
      const { firstName, lastName, email, phone, password, role, emailOtp, phoneOtp } = req.body;
      const result = await mediator.send(new SignupCommand({
        firstName,
        lastName,
        email,
        phone,
        passwordText: password,
        role,
        emailOtp,
        phoneOtp,
      }));
      return ApiResponse.created(res, result);
    } catch (error) {
      next(error);
    }
  }

  static async clientSendOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { phone, whatsappNumber } = req.body;
      const targetPhone = phone || whatsappNumber;
      const result = await mediator.send(new ClientSendOtpCommand(targetPhone));
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  static async clientVerifyOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { phone, whatsappNumber, otp } = req.body;
      const targetPhone = phone || whatsappNumber;
      const result = await mediator.send(new ClientVerifyOtpCommand(targetPhone, otp));
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  static async clientSignup(req: Request, res: Response, next: NextFunction) {
    try {
      const { firstName, lastName, phone, whatsappNumber, password, otp } = req.body;
      const targetPhone = phone || whatsappNumber;
      const result = await mediator.send(new ClientSignupCommand({
        firstName,
        lastName,
        phone: targetPhone,
        passwordText: password,
        otp,
      }));
      return ApiResponse.created(res, result);
    } catch (error) {
      next(error);
    }
  }

  static async clientSendEmailVerification(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const { email } = req.body;
      const result = await mediator.send(new ClientSendEmailVerificationCommand(userId, email));
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  static async clientVerifyEmailMagicLink(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.body;
      const result = await mediator.send(new ClientVerifyEmailMagicLinkCommand(token));
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { identifier, email, phone, password } = req.body;
      const loginIdentifier = identifier || email || phone;
      const result = await mediator.send(new LoginCommand(loginIdentifier, password));
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  static async forgotPasswordSendOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { identifier, email, phone } = req.body;
      const targetIdentifier = identifier || email || phone;
      const result = await mediator.send(new SendForgotPasswordOtpCommand(targetIdentifier));
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  static async forgotPasswordVerifyOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { identifier, email, phone, otp } = req.body;
      const targetIdentifier = identifier || email || phone;
      const result = await mediator.send(new VerifyForgotPasswordOtpCommand(targetIdentifier, otp));
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  static async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { resetToken, newPassword, password } = req.body;
      const passwordToSet = newPassword || password;
      const result = await mediator.send(new ResetPasswordCommand(resetToken, passwordToSet));
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  static async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      const result = await mediator.send(new RefreshTokenCommand(refreshToken));
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      const result = await mediator.send(new LogoutCommand(refreshToken));
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  static async me(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await mediator.send(new GetProfileQuery(req.user!.id));
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }
}
