import { BoostedEvent } from '../entities/boosted-event.entity';

export interface IBoostedEventRepository {
  upsert(eventId: string, data: {
    priority: number;
    tier?: string;
    price?: number;
    startDate: Date;
    endDate: Date;
    isActive: boolean;
  }): Promise<BoostedEvent>;

  findActiveBoostedEvents(): Promise<BoostedEvent[]>;
  update(id: string, data: any): Promise<BoostedEvent>;
  findAllBoostRequests(): Promise<BoostedEvent[]>;
  findById(id: string): Promise<BoostedEvent | null>;

  delete(eventId: string): Promise<boolean>;
}
