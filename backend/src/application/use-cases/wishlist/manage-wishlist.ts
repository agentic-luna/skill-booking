import { IRequest, IRequestHandler } from '../../common/mediator';
import { IWishlistRepository } from '../../../domain/repositories/wishlist.repository';
import { IEventRepository } from '../../../domain/repositories/event.repository';
import { BadRequestError, NotFoundError } from '../../common/errors';

// 1. Add to Wishlist
export class AddToWishlistCommand implements IRequest<any> {
  readonly __tag = 'AddToWishlistCommand';
  constructor(public readonly clientId: string, public readonly eventId: string) {}
}

export class AddToWishlistCommandHandler implements IRequestHandler<AddToWishlistCommand, any> {
  constructor(
    private wishlistRepo: IWishlistRepository,
    private eventRepo: IEventRepository
  ) {}

  async handle(command: AddToWishlistCommand): Promise<any> {
    const { clientId, eventId } = command;
    if (!eventId) throw new BadRequestError('Event ID is required');

    const event = await this.eventRepo.findById(eventId);
    if (!event) throw new NotFoundError('Event not found');

    const item = await this.wishlistRepo.add(clientId, eventId);
    return { success: true, item };
  }
}

// 2. Remove from Wishlist
export class RemoveFromWishlistCommand implements IRequest<any> {
  readonly __tag = 'RemoveFromWishlistCommand';
  constructor(public readonly clientId: string, public readonly eventId: string) {}
}

export class RemoveFromWishlistCommandHandler implements IRequestHandler<RemoveFromWishlistCommand, any> {
  constructor(private wishlistRepo: IWishlistRepository) {}

  async handle(command: RemoveFromWishlistCommand): Promise<any> {
    const { clientId, eventId } = command;
    if (!eventId) throw new BadRequestError('Event ID is required');

    const removed = await this.wishlistRepo.remove(clientId, eventId);
    return { success: removed };
  }
}

// 3. Get User Wishlist
export class GetUserWishlistQuery implements IRequest<any> {
  readonly __tag = 'GetUserWishlistQuery';
  constructor(public readonly clientId: string) {}
}

export class GetUserWishlistQueryHandler implements IRequestHandler<GetUserWishlistQuery, any> {
  constructor(private wishlistRepo: IWishlistRepository) {}

  async handle(query: GetUserWishlistQuery): Promise<any> {
    const items = await this.wishlistRepo.findByClient(query.clientId);
    return { items, count: items.length };
  }
}
