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
    async findProfile(id) {
        return prisma_1.prisma.user.findUnique({
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
    async findHostProfileByUserId(userId) {
        return prisma_1.prisma.hostProfile.findUnique({ where: { userId } });
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
}
exports.PrismaUserRepository = PrismaUserRepository;
