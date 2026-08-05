"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaUserRepository = void 0;
const prisma_1 = require("../../../config/prisma");
class PrismaUserRepository {
    async findById(id) {
        return prisma_1.prisma.user.findUnique({ where: { id } });
    }
    async findByEmail(email) {
        return prisma_1.prisma.user.findUnique({ where: { email } });
    }
    async findByPhone(phone) {
        return prisma_1.prisma.user.findUnique({ where: { phone } });
    }
    async create(data) {
        return prisma_1.prisma.user.create({ data });
    }
    async updatePassword(id, passwordHash) {
        return prisma_1.prisma.user.update({
            where: { id },
            data: { passwordHash },
        });
    }
    async updateEmail(id, email, isEmailVerified) {
        return prisma_1.prisma.user.update({
            where: { id },
            data: { email, isEmailVerified },
        });
    }
    async findProfile(id) {
        const user = await prisma_1.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                isEmailVerified: true,
                role: true,
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
                        bankDetail: {
                            select: {
                                id: true,
                                hostProfileId: true,
                                bankName: true, // not encrypted
                                updatedAt: true,
                                // accountHolderName, accountNumber, ifscCode, upiId are encrypted — excluded
                            },
                        },
                    },
                },
            },
        });
        return user;
    }
    async findHostProfileByUserId(userId) {
        return prisma_1.prisma.hostProfile.findUnique({ where: { userId } });
    }
    async findHostProfileById(id) {
        return prisma_1.prisma.hostProfile.findUnique({ where: { id } });
    }
    async upsertHostProfile(userId, data) {
        return prisma_1.prisma.hostProfile.upsert({
            where: { userId },
            update: data,
            create: {
                userId,
                ...data,
            },
        });
    }
    async findClientProfileByUserId(userId) {
        return prisma_1.prisma.clientProfile.findUnique({ where: { userId } });
    }
    async upsertClientProfile(userId, data) {
        const profileData = data || {};
        return prisma_1.prisma.clientProfile.upsert({
            where: { userId },
            update: profileData,
            create: {
                userId,
                ...profileData,
            },
        });
    }
    async findAdminProfileByUserId(userId) {
        return prisma_1.prisma.adminProfile.findUnique({ where: { userId } });
    }
    async upsertAdminProfile(userId, data) {
        const profileData = data || {};
        return prisma_1.prisma.adminProfile.upsert({
            where: { userId },
            update: profileData,
            create: {
                userId,
                ...profileData,
            },
        });
    }
    async findHostBankDetail(hostProfileId) {
        return prisma_1.prisma.hostBankDetail.findUnique({ where: { hostProfileId } });
    }
    async upsertHostBankDetail(hostProfileId, data) {
        return prisma_1.prisma.hostBankDetail.upsert({
            where: { hostProfileId },
            update: data,
            create: {
                hostProfileId,
                ...data,
            },
        });
    }
    async updateHostBankDetail(hostProfileId, data) {
        return prisma_1.prisma.hostBankDetail.update({
            where: { hostProfileId },
            data,
        });
    }
    async findUsers(filters) {
        return prisma_1.prisma.user.findMany({ where: filters });
    }
    async findPendingKycHosts() {
        // Use a direct join-style approach via prisma.user.findMany to avoid include bugs
        const users = await prisma_1.prisma.user.findMany({
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
    async countHosts(filters) {
        return prisma_1.prisma.user.count({
            where: {
                role: 'HOST',
                deletedAt: null,
                ...(filters?.kycStatus
                    ? { hostProfile: { kycStatus: filters.kycStatus } }
                    : {}),
            },
        });
    }
    async findAllHosts(filters, skip, take) {
        const users = await prisma_1.prisma.user.findMany({
            ...(skip !== undefined ? { skip } : {}),
            ...(take !== undefined ? { take } : {}),
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
                                accountNumber: true,
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
    async updateKycStatus(hostProfileId, status, _rejectionReason) {
        return prisma_1.prisma.hostProfile.update({
            where: { id: hostProfileId },
            data: { kycStatus: status },
        });
    }
}
exports.PrismaUserRepository = PrismaUserRepository;
