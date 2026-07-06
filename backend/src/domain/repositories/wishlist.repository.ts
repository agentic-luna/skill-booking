import { Wishlist } from '../entities';

export interface IWishlistRepository {
  add(clientId: string, eventId: string): Promise<Wishlist>;
  remove(clientId: string, eventId: string): Promise<boolean>;
  findByClient(clientId: string): Promise<Wishlist[]>;
  exists(clientId: string, eventId: string): Promise<boolean>;
}
