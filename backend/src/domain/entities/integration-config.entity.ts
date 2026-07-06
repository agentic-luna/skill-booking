import { IntegrationService, IntegrationEnvironment } from '@prisma/client';

export interface IntegrationConfig {
  id: string;
  serviceName: IntegrationService;
  environment: IntegrationEnvironment;
  credentials: any;
  isActive: boolean;
  updatedBy: string;
  updatedAt: Date;
}
