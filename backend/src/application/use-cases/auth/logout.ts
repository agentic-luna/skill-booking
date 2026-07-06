import jwt from 'jsonwebtoken';
import { ICacheService } from '../../services/cache.service';
import { env } from '../../../config/environment';
import { IRequest, IRequestHandler } from '../../common/mediator';

export class LogoutCommand implements IRequest<any> {
  readonly __tag = 'LogoutCommand';
  constructor(public readonly refreshToken: string) {}
}

export class LogoutCommandHandler implements IRequestHandler<LogoutCommand, any> {
  constructor(private cacheService: ICacheService) {}

  async handle(command: LogoutCommand): Promise<any> {
    const { refreshToken } = command;
    try {
      const decoded = jwt.verify(refreshToken, env.JWT_SECRET) as { id: string };
      const cacheKey = `auth:refresh_tokens:${decoded.id}:${refreshToken}`;
      await this.cacheService.del(cacheKey);
      return { success: true, message: 'Logged out successfully' };
    } catch (e) {
      return { success: true, message: 'Logged out successfully' };
    }
  }
}
