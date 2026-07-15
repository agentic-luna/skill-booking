import { EventMode, EventStatus, CommissionType } from '@prisma/client';
import { Event, EventCommission } from '../entities';

export interface IEventRepository {
  findById(id: string): Promise<any>;
  findMany(filters: {
    title?: string;
    mode?: EventMode;
    hostId?: string;
    startTimeFrom?: string;
    status?: EventStatus;
  }): Promise<any[]>;
  create(data: {
    hostId: string;
    title: string;
    posterUrl: string;
    mode: EventMode;
    venue?: {
      address: string;
      meetingLink?: string | null;
    };
    instructor?: {
      name: string;
      bio?: string;
      photoUrl?: string;
      companyName?: string;
      facebook?: string | null;
      instagram?: string | null;
      linkedin?: string | null;
    };
    startTime: Date;
    totalSeats: number;
    availableSeats: number;
    status?: EventStatus;
    version?: number;
    price?: number;
    duration?: string;
    durationHours?: number;
    description?: string;
    category?: string;
  }): Promise<Event>;
  update(id: string, data: any): Promise<Event>;
  findPendingEvents(): Promise<any[]>;
  upsertCommission(
    eventId: string,
    commissionType: CommissionType,
    platformValue: number
  ): Promise<EventCommission>;
  decrementSeats(id: string, seatCount: number, currentVersion: number): Promise<boolean>;
  incrementSeats(id: string, seatCount: number): Promise<Event>;
}
