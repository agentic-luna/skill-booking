import { Event } from './event.entity';

export interface BoostedEvent {
  id: string;
  eventId: string;
  priority: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  event?: Event;
}
