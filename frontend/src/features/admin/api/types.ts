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

// ── Event Queue (Moderation) ─────────────────────────────────────────────

export type EventMode = "ONLINE" | "OFFLINE";
export type EventStatus = "PENDING" | "APPROVED" | "CANCELED";
export type CommissionType = "FIXED" | "PERCENTAGE";

export interface PendingEvent {
  id: string;
  hostId: string;
  title: string;
  description?: string;
  images: string[];
  trainerName?: string;
  trainerInfo?: string;
  trainerBio?: string;
  posterUrl: string;
  mode: EventMode;
  venueDetails?: Record<string, unknown>;
  startTime: string;
  totalSeats: number;
  availableSeats: number;
  status: EventStatus;
  version: number;
  createdAt: string;
  updatedAt: string;
  host?: {
    id: string;
    userId: string;
    accountType: string;
    bio?: string;
    kycStatus: string;
    user?: {
      firstName: string;
      lastName: string;
      phone: string;
    };
  };
}

export interface ApproveEventPayload {
  commissionType: CommissionType;
  platformValue: number;
}

export interface ApproveEventResult {
  event: PendingEvent;
  commission: {
    id: string;
    eventId: string;
    commissionType: CommissionType;
    platformValue: number;
    assignedAt: string;
  };
}

// ── Finance / Ledger ─────────────────────────────────────────────────────

export interface FinanceLedger {
  totalEscrowLiabilities: number;
  totalRealizedRevenue: number;
  totalRefunded: number;
  ledgerCount: number;
}

export interface PayoutResult {
  success: boolean;
  amount?: number;
  payoutId?: string;
  transactionsPaid?: number;
  message?: string;
}

// ── KYC / Host Management ────────────────────────────────────────────────

export type KycStatus = "PENDING" | "APPROVED" | "REJECTED";
export type AccountType = "INDIVIDUAL" | "COMPANY";

export interface HostBankDetail {
  id: string;
  accountHolderName: string;
  bankName: string;
  ifscCode: string;
  upiId?: string;
  updatedAt: string;
}

export interface HostEvent {
  id: string;
  title: string;
  status: EventStatus;
  startTime: string;
  totalSeats: number;
  availableSeats: number;
}

export interface HostProfile {
  id: string;
  accountType: AccountType;
  govIdUrl?: string;
  gstNumber?: string;
  kycStatus: KycStatus;
  bio?: string;
  updatedAt: string;
  bankDetail?: HostBankDetail;
  events?: HostEvent[];
}

export interface HostWithProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: "ACTIVE" | "SUSPENDED";
  createdAt: string;
  updatedAt?: string;
  hostProfile?: HostProfile;
}

export interface HostsResponse {
  count: number;
  hosts: HostWithProfile[];
}

export interface KycReviewPayload {
  decision: "APPROVED" | "REJECTED";
  rejectionReason?: string;
}

export interface KycReviewResult {
  message: string;
  hostProfile: HostProfile;
}
