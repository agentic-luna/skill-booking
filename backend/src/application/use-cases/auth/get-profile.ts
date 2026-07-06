import { IUserRepository } from '../../../domain/repositories/user.repository';
import { IRequest, IRequestHandler } from '../../common/mediator';

import { NotFoundError } from '../../common/errors';

export class GetProfileQuery implements IRequest<any> {
  readonly __tag = 'GetProfileQuery';
  constructor(public readonly userId: string) {}
}

export class GetProfileQueryHandler implements IRequestHandler<GetProfileQuery, any> {
  constructor(private userRepo: IUserRepository) {}

  async handle(query: GetProfileQuery): Promise<any> {
    const { userId } = query;
    const userProfile = await this.userRepo.findProfile(userId);
    if (!userProfile) {
      throw new NotFoundError('User profile not found');
    }
    return userProfile;
  }
}
