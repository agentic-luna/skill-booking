import { UserRole, UserStatus, AccountType, KycStatus } from '@prisma/client';
import { User, HostProfile, HostBankDetail, ClientProfile, AdminProfile } from '../entities';

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByPhone(phone: string): Promise<User | null>;
  create(data: {
    firstName: string;
    lastName: string;
    email?: string | null;
    phone: string;
    passwordHash: string;
    role?: UserRole;
  }): Promise<User>;
  updatePassword(id: string, passwordHash: string): Promise<User>;
  findProfile(id: string): Promise<any>;
  findHostProfileByUserId(userId: string): Promise<HostProfile | null>;
  upsertHostProfile(
    userId: string,
    data: {
      accountType?: AccountType;
      govIdUrl?: string;
      gstNumber?: string;
      kycStatus?: KycStatus;
      bio?: string;
    }
  ): Promise<HostProfile>;
  findClientProfileByUserId(userId: string): Promise<ClientProfile | null>;
  upsertClientProfile(userId: string, data?: { avatarUrl?: string; bio?: string; city?: string; country?: string; preferences?: any }): Promise<ClientProfile>;
  findAdminProfileByUserId(userId: string): Promise<AdminProfile | null>;
  upsertAdminProfile(userId: string, data?: { department?: string; adminLevel?: number; lastLoginIp?: string }): Promise<AdminProfile>;
  findHostBankDetail(hostProfileId: string): Promise<HostBankDetail | null>;
  upsertHostBankDetail(
    hostProfileId: string,
    data: {
      accountHolderName: string;
      accountNumber: string;
      ifscCode: string;
      bankName: string;
      upiId?: string | null;
    }
  ): Promise<HostBankDetail>;
  updateHostBankDetail(
    hostProfileId: string,
    data: {
      accountHolderName?: string;
      accountNumber?: string;
      ifscCode?: string;
      bankName?: string;
      upiId?: string | null;
    }
  ): Promise<HostBankDetail>;
  findUsers(filters: {
    role?: UserRole;
    status?: UserStatus;
    deletedAt?: Date | null;
  }): Promise<User[]>;
  findPendingKycHosts(): Promise<any[]>;
  findAllHosts(filters?: { kycStatus?: KycStatus }): Promise<any[]>;
  updateKycStatus(hostProfileId: string, status: KycStatus, rejectionReason?: string): Promise<HostProfile>;
}
