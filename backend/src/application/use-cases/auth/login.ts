import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { IUserRepository } from '../../../domain/repositories/user.repository';
import { ICacheService } from '../../services/cache.service';
import { env } from '../../../config/environment';
import { IRequest, IRequestHandler } from '../../common/mediator';
import { getPermissionsForRole } from '../../../security/system.roles';
import { BadRequestError, ForbiddenError } from '../../common/errors';

export class LoginCommand implements IRequest<any> {
  readonly __tag = 'LoginCommand';
  constructor(
    public readonly identifier: string,
    public readonly passwordText: string
  ) {}
}

export class LoginCommandHandler implements IRequestHandler<LoginCommand, any> {
  constructor(
    private userRepo: IUserRepository,
    private cacheService: ICacheService
  ) {}

  async handle(command: LoginCommand): Promise<any> {
    const { identifier, passwordText } = command;

    if (!identifier || !passwordText) {
      throw new BadRequestError('Email or mobile number and password are required');
    }

    let user = await this.userRepo.findByEmail(identifier);
    if (!user) {
      user = await this.userRepo.findByPhone(identifier);
    }

    if (!user || user.deletedAt) {
      throw new BadRequestError('Invalid email/mobile number or password');
    }

    if (user.role === 'SUPERADMIN') {
      throw new ForbiddenError('Platform Superadmins must authenticate via the dedicated admin login portal (/api/v1/admin/login).');
    }

    if (user.status === 'SUSPENDED') {
      throw new ForbiddenError('Your account is suspended. Please contact support.');
    }

    const isMatch = await bcrypt.compare(passwordText, user.passwordHash);
    if (!isMatch) {
      throw new BadRequestError('Invalid email or password');
    }

    const permissions = getPermissionsForRole(user.role);

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
      },
      accessToken,
      refreshToken,
    };
  }
}
