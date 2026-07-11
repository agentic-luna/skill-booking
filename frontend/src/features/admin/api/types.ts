// ── Admin Config & Controls — API Types ──────────────────────────────────

// ── Integration Configs ─────────────────────────────────────────────────

export type ServiceName = "TWILIO" | "SENDGRID" | "META_WA" | "RAZORPAY";

export interface IntegrationConfig {
  id: string;
  serviceName: ServiceName;
  environment: "SANDBOX" | "PRODUCTION";
  credentials: Record<string, string>; // masked values from backend
  isActive: boolean;
  updatedAt: string;
}

// Setup payloads for POST /integrations/*
export interface TwilioSetupPayload {
  environment: "SANDBOX" | "PRODUCTION";
  accountSid: string;
  authToken: string;
  fromNumber: string;
  isActive?: boolean;
}

export interface SendgridSetupPayload {
  environment: "SANDBOX" | "PRODUCTION";
  apiKey: string;
  fromEmail: string;
  fromName: string;
  isActive?: boolean;
}

export interface MetaWaSetupPayload {
  environment: "SANDBOX" | "PRODUCTION";
  accessToken: string;
  phoneNumberId: string;
  businessAccountId: string;
  isActive?: boolean;
}

export interface RazorpaySetupPayload {
  environment: "SANDBOX" | "PRODUCTION";
  keyId: string;
  keySecret: string;
  webhookSecret: string;
  isActive?: boolean;
}

export interface UpdateIntegrationPayload {
  environment?: "SANDBOX" | "PRODUCTION";
  credentials?: Record<string, string>;
  isActive?: boolean;
}

// ── Message Templates ───────────────────────────────────────────────────

export interface MessageTemplate {
  id: string;
  channel: "EMAIL" | "SMS" | "WHATSAPP";
  triggerEvent: string;
  subject?: string;
  bodyContent: string;
  variables: string[];
  isActive: boolean;
  updatedAt: string;
}

export interface UpdateTemplatePayload {
  bodyContent?: string;
  variables?: string[];
  isActive?: boolean;
  subject?: string;
}

// ── Platform Settings ────────────────────────────────────────────────────

export interface PlatformSetting {
  id: string;
  key: string;
  value: string;
  updatedAt: string;
}

export interface UpsertPlatformPayload {
  key: string;
  value: string;
}

// ── Notification Logs ────────────────────────────────────────────────────

export interface NotificationLog {
  id: string;
  channel: "EMAIL" | "SMS" | "WHATSAPP" | "PUSH";
  recipientId?: string;
  recipientEmail?: string;
  recipientPhone?: string;
  triggerEvent: string;
  subject?: string;
  status: "SENT" | "FAILED" | "PENDING" | "QUEUED";
  createdAt: string;
}

export interface NotificationLogsResponse {
  logs: NotificationLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ── Broadcast ────────────────────────────────────────────────────────────

export type BroadcastChannel = "EMAIL" | "SMS" | "WHATSAPP" | "PUSH";
export type BroadcastCohort = "ALL" | "HOSTS" | "CLIENTS";

export interface BroadcastPayload {
  channel: BroadcastChannel;
  cohort: BroadcastCohort;
  targetUserId?: string;
  triggerEvent?: string;
  subject: string;
  bodyContent: string;
}

export interface BroadcastResult {
  sent: number;
  failed: number;
  channel: BroadcastChannel;
}
