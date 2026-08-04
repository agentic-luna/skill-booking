import { IntegrationService, IntegrationEnvironment } from '@prisma/client';
import { IntegrationConfig, PlatformSetting } from '../../../domain/entities';
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
