import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';
import { IUserRepository } from '../../../../domain/repositories/user.repository';
import { ICacheService } from '../../../services/cache.service';
import { env } from '../../../../config/environment';
import { IRequest, IRequestHandler } from '../../../common/mediator';
import { getPermissionsForRole } from '../../../../security/system.roles';
import { BadRequestError } from '../../../common/errors';

export class ClientSignupCommand implements IRequest<any> {
  readonly __tag = 'ClientSignupCommand';
  constructor(
    public readonly data: {
      firstName: string;
      lastName: string;
      phone: string;
      passwordText: string;
      otp?: string;
    }
  ) {}
}

export class ClientSignupCommandHandler implements IRequestHandler<ClientSignupCommand, any> {
  constructor(
    private userRepo: IUserRepository,
    private cacheService: ICacheService
  ) {}

  async handle(command: ClientSignupCommand): Promise<any> {
    const { data } = command;

    if (!data.firstName || !data.lastName || !data.phone || !data.passwordText) {
      throw new BadRequestError('First name, last name, WhatsApp / mobile number, and password are required');
    }

    const normalizedPhone = data.phone.trim();

    const existingPhone = await this.userRepo.findByPhone(normalizedPhone);
    if (existingPhone) {
      throw new BadRequestError('Phone number is already registered');
    }

    // Verify WhatsApp / Phone OTP
    if (data.otp) {
      const primaryOtpKey = `otp:CLIENT_PHONE:${normalizedPhone}`;
      const fallbackOtpKey = `otp:PHONE:${normalizedPhone}`;
      
      let cachedOtp = await this.cacheService.get<string>(primaryOtpKey);
      if (!cachedOtp) {
        cachedOtp = await this.cacheService.get<string>(fallbackOtpKey);
      }

      if (!cachedOtp || cachedOtp !== data.otp.trim()) {
        throw new BadRequestError('Invalid or expired OTP code');
      }

      await this.cacheService.del(primaryOtpKey);
      await this.cacheService.del(fallbackOtpKey);
    } else {
      const primaryVerifiedKey = `otp:verified:CLIENT_PHONE:${normalizedPhone}`;
      const fallbackVerifiedKey = `otp:verified:PHONE:${normalizedPhone}`;
      
      const isVerifiedPrimary = await this.cacheService.get<string>(primaryVerifiedKey);
      const isVerifiedFallback = await this.cacheService.get<string>(fallbackVerifiedKey);

      if (!isVerifiedPrimary && !isVerifiedFallback) {
        throw new BadRequestError('WhatsApp / Phone OTP verification is required before completing signup');
      }
    }

    // Clean up Redis verification flags
    await this.cacheService.del(`otp:verified:CLIENT_PHONE:${normalizedPhone}`);
    await this.cacheService.del(`otp:verified:PHONE:${normalizedPhone}`);

    const hashedPassword = await bcrypt.hash(data.passwordText, 10);
    
    // Create client user without email requirement
    const user = await this.userRepo.create({
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      phone: normalizedPhone,
      email: null,
      passwordHash: hashedPassword,
      role: UserRole.CLIENT,
    });

    // Auto-create Client Profile (1-1 relation)
    await this.userRepo.upsertClientProfile(user.id);

    const permissions = getPermissionsForRole(user.role);

    const accessToken = jwt.sign(
      { id: user.id, email: user.email || null, role: user.role, permissions },
      env.JWT_SECRET,
      { expiresIn: '5d' }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const cacheKey = `auth:refresh_tokens:${user.id}:${refreshToken}`;
    await this.cacheService.set(cacheKey, '1', 7 * 24 * 60 * 60);

    const fullProfile = await this.userRepo.findProfile(user.id);

    return {
      user: fullProfile,
      accessToken,
      refreshToken,
    };
  }
}
