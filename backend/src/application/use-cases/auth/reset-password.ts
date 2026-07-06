import bcrypt from 'bcryptjs';
import { IRequest, IRequestHandler } from '../../common/mediator';
import { IUserRepository } from '../../../domain/repositories/user.repository';
import { ICacheService } from '../../services/cache.service';
import { ILoggerService } from '../../services/logger.service';
import { BadRequestError, NotFoundError } from '../../common/errors';

export class ResetPasswordCommand implements IRequest<any> {
  readonly __tag = 'ResetPasswordCommand';
  constructor(
    public readonly resetToken: string,
    public readonly newPasswordText: string
  ) {}
}

export class ResetPasswordCommandHandler implements IRequestHandler<ResetPasswordCommand, any> {
  constructor(
    private userRepo: IUserRepository,
    private cacheService: ICacheService,
    private logger: ILoggerService
  ) {}

  async handle(command: ResetPasswordCommand): Promise<any> {
    const { resetToken, newPasswordText } = command;

    if (!resetToken || !newPasswordText) {
      throw new BadRequestError('Reset token and new password are required');
    }

    if (newPasswordText.length < 6) {
      throw new BadRequestError('Password must be at least 6 characters long');
    }

    const resetTokenKey = `forgot_pwd_token:${resetToken}`;
    const userId = await this.cacheService.get<string>(resetTokenKey);

    if (!userId) {
      throw new BadRequestError('Invalid or expired password reset token. Please request a new OTP.');
    }

    const user = await this.userRepo.findById(userId);
    if (!user || user.deletedAt) {
      throw new NotFoundError('User account not found');
    }

    // Hash new password and update in DB
    const passwordHash = await bcrypt.hash(newPasswordText, 10);
    await this.userRepo.updatePassword(user.id, passwordHash);

    // Invalidate the reset token
    await this.cacheService.del(resetTokenKey);

    this.logger.info(`[ResetPassword] Password successfully reset for user ${user.id}`);

    return {
      success: true,
      message: 'Your password has been reset successfully. You can now login with your new password.',
    };
  }
}
