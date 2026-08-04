import { IntegrationService, IntegrationEnvironment } from '@prisma/client';
import { IntegrationConfig, PlatformSetting } from '../entities';

export interface IConfigRepository {
  // Gateways & Configurations
  findIntegration(serviceName: IntegrationService): Promise<IntegrationConfig | null>;
  findAllIntegrations(): Promise<IntegrationConfig[]>;
  upsertIntegration(
    serviceName: IntegrationService,
    data: {
      environment: IntegrationEnvironment;
      credentials: any;
      isActive: boolean;
      updatedBy: string;
    }
  ): Promise<IntegrationConfig>;

  // Platform settings / branding matrix
  findPlatformSetting(key: string): Promise<PlatformSetting | null>;
  findAllPlatformSettings(): Promise<PlatformSetting[]>;
  upsertPlatformSetting(key: string, value: any): Promise<PlatformSetting>;
}
