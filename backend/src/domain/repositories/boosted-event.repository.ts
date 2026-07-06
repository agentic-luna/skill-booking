import { BoostedEvent } from '../entities/boosted-event.entity';

export interface IBoostedEventRepository {
  upsert(eventId: string, data: {
    priority: number;
    startDate: Date;
    endDate: Date;
    isActive: boolean;
  }): Promise<BoostedEvent>;

  findActiveBoostedEvents(): Promise<BoostedEvent[]>;

  delete(eventId: string): Promise<boolean>;
}
