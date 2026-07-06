import { IntegrationService, IntegrationEnvironment } from '@prisma/client';
import { IntegrationConfig, MessageTemplate, PlatformSetting } from '../../../domain/entities';
import { IConfigRepository } from '../../../domain/repositories/config.repository';
import { prisma } from '../../../config/prisma';

export class PrismaConfigRepository implements IConfigRepository {
  async findIntegration(
    serviceName: IntegrationService
  ): Promise<IntegrationConfig | null> {
    return prisma.integrationConfig.findUnique({ where: { serviceName } });
  }

  async findAllIntegrations(): Promise<IntegrationConfig[]> {
    return prisma.integrationConfig.findMany();
  }

  async upsertIntegration(
    serviceName: IntegrationService,
    data: {
      environment: IntegrationEnvironment;
      credentials: any;
      isActive: boolean;
      updatedBy: string;
    }
  ): Promise<IntegrationConfig> {
    return prisma.integrationConfig.upsert({
      where: { serviceName },
      update: data,
      create: {
        serviceName,
        ...data,
      },
    });
  }

  async findTemplates(filters?: { triggerEvent?: string; isActive?: boolean }): Promise<MessageTemplate[]> {
    const whereClause: any = {};
    if (filters) {
      if (filters.triggerEvent) {
        whereClause.triggerEvent = filters.triggerEvent as any;
      }
      if (filters.isActive !== undefined) {
        whereClause.isActive = filters.isActive;
      }
    }
    return prisma.messageTemplate.findMany({ where: whereClause });
  }

  async findTemplateById(id: string): Promise<MessageTemplate | null> {
    return prisma.messageTemplate.findUnique({ where: { id } });
  }

  async updateTemplate(
    id: string,
    data: {
      bodyContent?: string;
      subject?: string | null;
      isActive?: boolean;
      variables?: any;
    }
  ): Promise<MessageTemplate> {
    return prisma.messageTemplate.update({
      where: { id },
      data,
    });
  }

  async findPlatformSetting(key: string): Promise<PlatformSetting | null> {
    return prisma.platformSetting.findUnique({ where: { key } });
  }

  async findAllPlatformSettings(): Promise<PlatformSetting[]> {
    return prisma.platformSetting.findMany();
  }

  async upsertPlatformSetting(key: string, value: any): Promise<PlatformSetting> {
    return prisma.platformSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }
}
