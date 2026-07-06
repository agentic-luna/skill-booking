import { UserRole, UserStatus } from '@prisma/client';
import { HostProfile } from './host-profile.entity';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  hostProfile?: HostProfile | null;
}
