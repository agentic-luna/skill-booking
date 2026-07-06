import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';
import { IUserRepository } from '../../../domain/repositories/user.repository';
import { ICacheService } from '../../services/cache.service';
import { env } from '../../../config/environment';
import { IRequest, IRequestHandler } from '../../common/mediator';
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

    const existingEmail = await this.userRepo.findByEmail(data.email);
    if (existingEmail) {
      throw new BadRequestError('Email is already registered');
    }

    const existingPhone = await this.userRepo.findByPhone(data.phone);
    if (existingPhone) {
      throw new BadRequestError('Phone number is already registered');
    }

    // 1. Verify Email OTP
    if (data.emailOtp) {
      const emailOtpKey = `otp:EMAIL:${data.email}`;
      const cachedOtp = await this.cacheService.get<string>(emailOtpKey);
      if (!cachedOtp || cachedOtp !== data.emailOtp) {
        throw new BadRequestError('Invalid or expired Email OTP');
      }
      await this.cacheService.del(emailOtpKey);
    } else {
      const emailVerifiedKey = `otp:verified:EMAIL:${data.email}`;
      const isEmailVerified = await this.cacheService.get<string>(emailVerifiedKey);
      if (!isEmailVerified) {
        throw new BadRequestError('Email OTP verification is required before completing signup');
      }
    }

    // 2. Verify Phone OTP
    if (data.phoneOtp) {
      const phoneOtpKey = `otp:PHONE:${data.phone}`;
      const cachedOtp = await this.cacheService.get<string>(phoneOtpKey);
      if (!cachedOtp || cachedOtp !== data.phoneOtp) {
        throw new BadRequestError('Invalid or expired Phone OTP');
      }
      await this.cacheService.del(phoneOtpKey);
    } else {
      const phoneVerifiedKey = `otp:verified:PHONE:${data.phone}`;
      const isPhoneVerified = await this.cacheService.get<string>(phoneVerifiedKey);
      if (!isPhoneVerified) {
        throw new BadRequestError('Phone OTP verification is required before completing signup');
      }
    }

    // Clean up Redis verification flags
    await this.cacheService.del(`otp:verified:EMAIL:${data.email}`);
    await this.cacheService.del(`otp:verified:PHONE:${data.phone}`);

    const hashedPassword = await bcrypt.hash(data.passwordText, 10);
    const user = await this.userRepo.create({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      passwordHash: hashedPassword,
      role: data.role || UserRole.CLIENT,
    });

    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      env.JWT_SECRET,
      { expiresIn: '15m' }
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
