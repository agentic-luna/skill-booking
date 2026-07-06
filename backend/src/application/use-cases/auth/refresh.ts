import jwt from 'jsonwebtoken';
import { IUserRepository } from '../../../domain/repositories/user.repository';
import { ICacheService } from '../../services/cache.service';
import { env } from '../../../config/environment';
import { UnauthorizedError } from '../../common/errors';
import { IRequest, IRequestHandler } from '../../common/mediator';
import { getPermissionsForRole } from '../../../security/system.roles';

export class RefreshTokenCommand implements IRequest<any> {
  readonly __tag = 'RefreshTokenCommand';
  constructor(public readonly oldRefreshToken: string) {}
}

export class RefreshTokenCommandHandler implements IRequestHandler<RefreshTokenCommand, any> {
  constructor(
    private userRepo: IUserRepository,
    private cacheService: ICacheService
  ) {}

  async handle(command: RefreshTokenCommand): Promise<any> {
    const { oldRefreshToken } = command;
    try {
      const decoded = jwt.verify(oldRefreshToken, env.JWT_SECRET) as { id: string };

      const cacheKey = `auth:refresh_tokens:${decoded.id}:${oldRefreshToken}`;
      const exists = await this.cacheService.get(cacheKey);

      if (!exists) {
        throw new UnauthorizedError('Invalid or revoked refresh token');
      }

      const user = await this.userRepo.findById(decoded.id);

      if (!user || user.deletedAt || user.status === 'SUSPENDED') {
        throw new UnauthorizedError('User account is invalid or suspended');
      }

      // Revoke the old token
      await this.cacheService.del(cacheKey);

      const permissions = getPermissionsForRole(user.role);

      const accessToken = jwt.sign(
        { id: user.id, email: user.email, role: user.role, permissions },
        env.JWT_SECRET,
        { expiresIn: '5d' }
      );

      const newRefreshToken = jwt.sign(
        { id: user.id },
        env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      const newCacheKey = `auth:refresh_tokens:${user.id}:${newRefreshToken}`;
      await this.cacheService.set(newCacheKey, '1', 7 * 24 * 60 * 60);

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
        refreshToken: newRefreshToken,
      };
    } catch (e: any) {
      const err = new Error(e.message || 'Invalid refresh token') as any;
      err.statusCode = 401;
      throw err;
    }
  }
}
