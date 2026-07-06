import { IntegrationService, IntegrationEnvironment } from '@prisma/client';
import { IntegrationConfig, MessageTemplate, PlatformSetting } from '../entities';

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

  // Message Notification Templates
  findTemplates(filters?: { triggerEvent?: string; isActive?: boolean }): Promise<MessageTemplate[]>;
  findTemplateById(id: string): Promise<MessageTemplate | null>;
  updateTemplate(
    id: string,
    data: {
      bodyContent?: string;
      subject?: string | null;
      isActive?: boolean;
      variables?: any;
    }
  ): Promise<MessageTemplate>;

  // Platform settings / branding matrix
  findPlatformSetting(key: string): Promise<PlatformSetting | null>;
  findAllPlatformSettings(): Promise<PlatformSetting[]>;
  upsertPlatformSetting(key: string, value: any): Promise<PlatformSetting>;
}
