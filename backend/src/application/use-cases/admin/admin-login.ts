import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';
import { IUserRepository } from '../../../domain/repositories/user.repository';
import { ICacheService } from '../../services/cache.service';
import { env } from '../../../config/environment';
import { IRequest, IRequestHandler } from '../../common/mediator';
import { getPermissionsForRole } from '../../../security/system.roles';
import { BadRequestError, ForbiddenError } from '../../common/errors';

export class AdminLoginCommand implements IRequest<any> {
  readonly __tag = 'AdminLoginCommand';
  constructor(
    public readonly identifier: string,
    public readonly passwordText: string,
    public readonly ipAddress?: string
  ) {}
}

export class AdminLoginCommandHandler implements IRequestHandler<AdminLoginCommand, any> {
  constructor(
    private userRepo: IUserRepository,
    private cacheService: ICacheService
  ) {}

  async handle(command: AdminLoginCommand): Promise<any> {
    const { identifier, passwordText, ipAddress } = command;

    if (!identifier || !passwordText) {
      throw new BadRequestError('Admin email/identifier and password are required');
    }

    let user = await this.userRepo.findByEmail(identifier);
    if (!user) {
      user = await this.userRepo.findByPhone(identifier);
    }

    if (!user || user.deletedAt) {
      throw new BadRequestError('Invalid admin credentials');
    }

    // Security Gate: Verify account has SUPERADMIN role
    if (user.role !== UserRole.SUPERADMIN) {
      throw new ForbiddenError('Access denied. Admin portal is restricted exclusively to Platform Superadmins.');
    }

    if (user.status === 'SUSPENDED') {
      throw new ForbiddenError('Admin account is suspended. Please contact platform system administrator.');
    }

    const isMatch = await bcrypt.compare(passwordText, user.passwordHash);
    if (!isMatch) {
      throw new BadRequestError('Invalid admin credentials');
    }

    // Upsert AdminProfile to update lastLoginIp
    const adminProfile = await this.userRepo.upsertAdminProfile(user.id, {
      lastLoginIp: ipAddress || '127.0.0.1',
    });

    const permissions = getPermissionsForRole(UserRole.SUPERADMIN);

    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role, permissions },
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
        adminProfile,
      },
      accessToken,
      refreshToken,
    };
  }
}
