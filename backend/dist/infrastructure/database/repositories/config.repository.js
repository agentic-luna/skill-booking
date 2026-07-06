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
    async findTemplates(filters) {
        const whereClause = {};
        if (filters) {
            if (filters.triggerEvent) {
                whereClause.triggerEvent = filters.triggerEvent;
            }
            if (filters.isActive !== undefined) {
                whereClause.isActive = filters.isActive;
            }
        }
        return prisma_1.prisma.messageTemplate.findMany({ where: whereClause });
    }
    async findTemplateById(id) {
        return prisma_1.prisma.messageTemplate.findUnique({ where: { id } });
    }
    async updateTemplate(id, data) {
        return prisma_1.prisma.messageTemplate.update({
            where: { id },
            data,
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
