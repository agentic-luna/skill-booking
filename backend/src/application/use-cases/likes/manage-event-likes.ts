import { IRequest, IRequestHandler } from '../../common/mediator';
import { IEventLikeRepository } from '../../../domain/repositories/event-like.repository';
import { IEventRepository } from '../../../domain/repositories/event.repository';
import { BadRequestError, NotFoundError } from '../../common/errors';

// 1. Toggle Like Event
export class ToggleEventLikeCommand implements IRequest<any> {
  readonly __tag = 'ToggleEventLikeCommand';
  constructor(public readonly clientId: string, public readonly eventId: string) {}
}

export class ToggleEventLikeCommandHandler implements IRequestHandler<ToggleEventLikeCommand, any> {
  constructor(
    private likeRepo: IEventLikeRepository,
    private eventRepo: IEventRepository
  ) {}

  async handle(command: ToggleEventLikeCommand): Promise<any> {
    const { clientId, eventId } = command;
    if (!eventId) throw new BadRequestError('Event ID is required');

    const event = await this.eventRepo.findById(eventId);
    if (!event) throw new NotFoundError('Event not found');

    const result = await this.likeRepo.toggleLike(clientId, eventId);
    const totalLikes = await this.likeRepo.getLikeCountForEvent(eventId);

    return {
      success: true,
      liked: result.liked,
      totalLikes,
      like: result.like,
    };
  }
}

// 2. Get User Liked Events
export class GetUserLikedEventsQuery implements IRequest<any> {
  readonly __tag = 'GetUserLikedEventsQuery';
  constructor(public readonly clientId: string) {}
}

export class GetUserLikedEventsQueryHandler implements IRequestHandler<GetUserLikedEventsQuery, any> {
  constructor(private likeRepo: IEventLikeRepository) {}

  async handle(query: GetUserLikedEventsQuery): Promise<any> {
    const likes = await this.likeRepo.findByClient(query.clientId);
    return { likes, count: likes.length };
  }
}
