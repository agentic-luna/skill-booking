import { UserRole, UserStatus, AccountType, KycStatus } from '@prisma/client';
import { User, HostProfile, HostBankDetail } from '../../../domain/entities';
import { IUserRepository } from '../../../domain/repositories/user.repository';
import { prisma } from '../../../config/prisma';

export class PrismaUserRepository implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  async findByPhone(phone: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { phone } });
  }

  async create(data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    passwordHash: string;
    role?: UserRole;
  }): Promise<User> {
    return prisma.user.create({ data });
  }

  async updatePassword(id: string, passwordHash: string): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: { passwordHash },
    });
  }

  async findProfile(id: string): Promise<any> {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true,
        hostProfile: {
          include: {
            bankDetail: true,
          },
        },
      },
    });
  }

  async findHostProfileByUserId(userId: string): Promise<HostProfile | null> {
    return prisma.hostProfile.findUnique({ where: { userId } });
  }

  async upsertHostProfile(
    userId: string,
    data: {
      accountType?: AccountType;
      govIdUrl?: string;
      gstNumber?: string;
      kycStatus?: KycStatus;
      bio?: string;
    }
  ): Promise<HostProfile> {
    return prisma.hostProfile.upsert({
      where: { userId },
      update: data,
      create: {
        userId,
        ...data,
      },
    }) as any;
  }

  async findClientProfileByUserId(userId: string): Promise<any> {
    return prisma.clientProfile.findUnique({ where: { userId } });
  }

  async upsertClientProfile(userId: string, data?: any): Promise<any> {
    const profileData = data || {};
    return prisma.clientProfile.upsert({
      where: { userId },
      update: profileData,
      create: {
        userId,
        ...profileData,
      },
    });
  }

  async findAdminProfileByUserId(userId: string): Promise<any> {
    return prisma.adminProfile.findUnique({ where: { userId } });
  }

  async upsertAdminProfile(userId: string, data?: any): Promise<any> {
    const profileData = data || {};
    return prisma.adminProfile.upsert({
      where: { userId },
      update: profileData,
      create: {
        userId,
        ...profileData,
      },
    });
  }

  async findHostBankDetail(hostProfileId: string): Promise<HostBankDetail | null> {
    return prisma.hostBankDetail.findUnique({ where: { hostProfileId } });
  }

  async upsertHostBankDetail(
    hostProfileId: string,
    data: {
      accountHolderName: string;
      accountNumber: string;
      ifscCode: string;
      bankName: string;
      upiId?: string | null;
    }
  ): Promise<HostBankDetail> {
    return prisma.hostBankDetail.upsert({
      where: { hostProfileId },
      update: data,
      create: {
        hostProfileId,
        ...data,
      },
    });
  }

  async updateHostBankDetail(
    hostProfileId: string,
    data: {
      accountHolderName?: string;
      accountNumber?: string;
      ifscCode?: string;
      bankName?: string;
      upiId?: string | null;
    }
  ): Promise<HostBankDetail> {
    return prisma.hostBankDetail.update({
      where: { hostProfileId },
      data,
    });
  }

  async findUsers(filters: {
    role?: UserRole;
    status?: UserStatus;
    deletedAt?: Date | null;
  }): Promise<User[]> {
    return prisma.user.findMany({ where: filters });
  }

  async findPendingKycHosts(): Promise<any[]> {
    // Use a direct join-style approach via prisma.user.findMany to avoid include bugs
    const users = await prisma.user.findMany({
      where: {
        role: 'HOST',
        hostProfile: { kycStatus: 'PENDING' },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        status: true,
        createdAt: true,
        hostProfile: {
          select: {
            id: true,
            userId: true,
            accountType: true,
            govIdUrl: true,
            gstNumber: true,
            kycStatus: true,
            bio: true,
            updatedAt: true,
            bankDetail: true,
          },
        },
      },
      orderBy: { hostProfile: { updatedAt: 'asc' } },
    });
    return users;
  }

  async findAllHosts(filters?: { kycStatus?: KycStatus }): Promise<any[]> {
    const users = await prisma.user.findMany({
      where: {
        role: 'HOST',
        deletedAt: null,
        ...(filters?.kycStatus
          ? { hostProfile: { kycStatus: filters.kycStatus } }
          : {}),
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        hostProfile: {
          select: {
            id: true,
            accountType: true,
            govIdUrl: true,
            gstNumber: true,
            kycStatus: true,
            bio: true,
            updatedAt: true,
            bankDetail: {
              select: {
                id: true,
                accountHolderName: true,
                bankName: true,
                ifscCode: true,
                upiId: true,
                updatedAt: true,
              },
            },
            events: {
              select: {
                id: true,
                title: true,
                status: true,
                startTime: true,
                totalSeats: true,
                availableSeats: true,
              },
              orderBy: { startTime: 'desc' },
              take: 5,
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return users;
  }

  async updateKycStatus(hostProfileId: string, status: KycStatus, _rejectionReason?: string): Promise<any> {
    return prisma.hostProfile.update({
      where: { id: hostProfileId },
      data: { kycStatus: status },
    });
  }
}
