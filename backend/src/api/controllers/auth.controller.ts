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
