import { EventMode, EventStatus } from '@prisma/client';
import { EventCommission } from './event-commission.entity';

export interface Event {
  id: string;
  hostId: string;
  title: string;
  description?: string | null;
  images?: string[];
  trainerName?: string | null;
  trainerInfo?: string | null;
  trainerBio?: string | null;
  posterUrl: string;
  mode: EventMode;
  venueDetails: any;
  startTime: Date;
  totalSeats: number;
  availableSeats: number;
  status: EventStatus;
  averageRating?: number;
  totalReviews?: number;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  commission?: EventCommission | null;
  host?: any;
  instructorId?: string | null;
  venueId?: string | null;
  instructor?: any;
  venue?: any;
}
