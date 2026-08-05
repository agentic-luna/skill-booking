"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaConfigRepository = void 0;
const prisma_1 = require("../../../config/prisma");
class PrismaConfigRepository {
    async findIntegration(serviceName) {
        return prisma_1.prisma.integrationConfig.findUnique({ where: { serviceName } });
    }
    async findAllIntegrations() {
        return prisma_1.prisma.integrationConfig.findMany();
    }
    async upsertIntegration(serviceName, data) {
        return prisma_1.prisma.integrationConfig.upsert({
            where: { serviceName },
            update: data,
            create: {
                serviceName,
                ...data,
            },
        });
    }
    async findPlatformSetting(key) {
        return prisma_1.prisma.platformSetting.findUnique({ where: { key } });
    }
    async findAllPlatformSettings() {
        return prisma_1.prisma.platformSetting.findMany();
    }
    async upsertPlatformSetting(key, value) {
        return prisma_1.prisma.platformSetting.upsert({
            where: { key },
            update: { value },
            create: { key, value },
        });
    }
}
exports.PrismaConfigRepository = PrismaConfigRepository;
