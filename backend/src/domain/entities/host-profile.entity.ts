import { AccountType, KycStatus } from '@prisma/client';
import { HostBankDetail } from './host-bank-detail.entity';

export interface HostProfile {
  id: string;
  userId: string;
  accountType: AccountType;
  govIdUrl: string;
  gstNumber: string | null;
  kycStatus: KycStatus;
  bio: string | null;
  averageRating?: number;
  totalReviews?: number;
  updatedAt: Date;
  bankDetail?: HostBankDetail | null;
}
