import { EventLike } from '../entities';

export interface IEventLikeRepository {
  toggleLike(clientId: string, eventId: string): Promise<{ liked: boolean; like?: EventLike }>;
  findByClient(clientId: string): Promise<EventLike[]>;
  exists(clientId: string, eventId: string): Promise<boolean>;
  getLikeCountForEvent(eventId: string): Promise<number>;
}
