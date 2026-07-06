import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRole, KycStatus } from '@prisma/client';
import { IUserRepository } from '../../../domain/repositories/user.repository';
import { ICacheService } from '../../services/cache.service';
import { env } from '../../../config/environment';
import { IRequest, IRequestHandler } from '../../common/mediator';
import { getPermissionsForRole } from '../../../security/system.roles';
import { BadRequestError } from '../../common/errors';

export class SignupCommand implements IRequest<any> {
  readonly __tag = 'SignupCommand';
  constructor(
    public readonly data: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      passwordText: string;
      role?: UserRole;
      emailOtp?: string;
      phoneOtp?: string;
    }
  ) {}
}

export class SignupCommandHandler implements IRequestHandler<SignupCommand, any> {
  constructor(
    private userRepo: IUserRepository,
    private cacheService: ICacheService
  ) {}

  async handle(command: SignupCommand): Promise<any> {
    const { data } = command;

    if (!data.email || !data.phone || !data.firstName || !data.lastName || !data.passwordText) {
      throw new BadRequestError('First name, last name, email, phone, and password are required');
    }

    const normalizedEmail = data.email.toLowerCase().trim();
    const normalizedPhone = data.phone.trim();

    const existingEmail = await this.userRepo.findByEmail(normalizedEmail);
    if (existingEmail) {
      throw new BadRequestError('Email is already registered');
    }

    const existingPhone = await this.userRepo.findByPhone(normalizedPhone);
    if (existingPhone) {
      throw new BadRequestError('Phone number is already registered');
    }

    // 1. Verify Email OTP
    if (data.emailOtp) {
      const emailOtpKey = `otp:EMAIL:${normalizedEmail}`;
      const cachedOtp = await this.cacheService.get<string>(emailOtpKey);
      if (!cachedOtp || cachedOtp !== data.emailOtp) {
        throw new BadRequestError('Invalid or expired Email OTP');
      }
      await this.cacheService.del(emailOtpKey);
    } else {
      const emailVerifiedKey = `otp:verified:EMAIL:${normalizedEmail}`;
      const isEmailVerified = await this.cacheService.get<string>(emailVerifiedKey);
      if (!isEmailVerified) {
        throw new BadRequestError('Email OTP verification is required before completing signup');
      }
    }

    // 2. Verify Phone OTP
    if (data.phoneOtp) {
      const phoneOtpKey = `otp:PHONE:${normalizedPhone}`;
      const cachedOtp = await this.cacheService.get<string>(phoneOtpKey);
      if (!cachedOtp || cachedOtp !== data.phoneOtp) {
        throw new BadRequestError('Invalid or expired Phone OTP');
      }
      await this.cacheService.del(phoneOtpKey);
    } else {
      const phoneVerifiedKey = `otp:verified:PHONE:${normalizedPhone}`;
      const isPhoneVerified = await this.cacheService.get<string>(phoneVerifiedKey);
      if (!isPhoneVerified) {
        throw new BadRequestError('Phone OTP verification is required before completing signup');
      }
    }

    // Clean up Redis verification flags
    await this.cacheService.del(`otp:verified:EMAIL:${normalizedEmail}`);
    await this.cacheService.del(`otp:verified:PHONE:${normalizedPhone}`);

    const hashedPassword = await bcrypt.hash(data.passwordText, 10);
    const userRole = data.role || UserRole.CLIENT;
    const user = await this.userRepo.create({
      firstName: data.firstName,
      lastName: data.lastName,
      email: normalizedEmail,
      phone: normalizedPhone,
      passwordHash: hashedPassword,
      role: userRole,
    });

    // Auto-create the appropriate profile based on role (1-1 relation)
    if (userRole === UserRole.CLIENT) {
      await this.userRepo.upsertClientProfile(user.id);
    } else if (userRole === UserRole.HOST) {
      // Create a stub HostProfile immediately so the 1-1 relation exists.
      // The host will later submit KYC details via POST /hosts/kyc which updates this record.
      await this.userRepo.upsertHostProfile(user.id, {
        kycStatus: KycStatus.PENDING,
      });
    }

    const permissions = getPermissionsForRole(user.role);

    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role, permissions },
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

    return {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
      },
      accessToken,
      refreshToken,
    };
  }
}
