import { UserRole, UserStatus } from '@prisma/client';
import { HostProfile } from './host-profile.entity';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string;
  passwordHash: string;
  isEmailVerified: boolean;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  hostProfile?: HostProfile | null;
}
