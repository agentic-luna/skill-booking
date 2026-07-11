import { request } from "@/features/auth/api/client";
import type {
  IntegrationConfig, UpdateIntegrationPayload,
  TwilioSetupPayload, SendgridSetupPayload, MetaWaSetupPayload, RazorpaySetupPayload,
  MessageTemplate, UpdateTemplatePayload,
  PlatformSetting, UpsertPlatformPayload,
  NotificationLogsResponse,
  BroadcastPayload, BroadcastResult,
  PendingEvent, ApproveEventPayload, ApproveEventResult,
  FinanceLedger, PayoutResult,
  HostWithProfile, HostsResponse, KycReviewPayload, KycReviewResult
} from "./types";

// ── Helpers ──────────────────────────────────────────────────────────────
type ApiData<T> = { success: boolean; data: T };

// ── Integration Setup (POST /integrations/*) ─────────────────────────────

export const setupTwilio = (payload: TwilioSetupPayload) =>
  request<ApiData<IntegrationConfig>>("/integrations/twilio", { method: "POST", body: JSON.stringify(payload) }).then(r => r.data);

export const setupSendgrid = (payload: SendgridSetupPayload) =>
  request<ApiData<IntegrationConfig>>("/integrations/sendgrid", { method: "POST", body: JSON.stringify(payload) }).then(r => r.data);

export const setupMetaWa = (payload: MetaWaSetupPayload) =>
  request<ApiData<IntegrationConfig>>("/integrations/meta-wa", { method: "POST", body: JSON.stringify(payload) }).then(r => r.data);

export const setupRazorpay = (payload: RazorpaySetupPayload) =>
  request<ApiData<IntegrationConfig>>("/integrations/razorpay", { method: "POST", body: JSON.stringify(payload) }).then(r => r.data);

// ── Admin Config — Integrations ──────────────────────────────────────────

export const getIntegrationConfigs = () =>
  request<ApiData<IntegrationConfig[]>>("/admin/configs/integrations").then(r => r.data);

export const updateIntegrationConfig = (serviceName: string, payload: UpdateIntegrationPayload) =>
  request<ApiData<IntegrationConfig>>(`/admin/configs/integrations/${serviceName}`, { method: "PUT", body: JSON.stringify(payload) }).then(r => r.data);

// ── Admin Config — Templates ─────────────────────────────────────────────

export const getTemplates = () =>
  request<ApiData<MessageTemplate[]>>("/admin/configs/templates").then(r => r.data);

export const updateTemplate = (templateId: string, payload: UpdateTemplatePayload) =>
  request<ApiData<MessageTemplate>>(`/admin/configs/templates/${templateId}`, { method: "PUT", body: JSON.stringify(payload) }).then(r => r.data);

// ── Admin Config — Platform Settings ─────────────────────────────────────

export const getPlatformSettings = () =>
  request<ApiData<PlatformSetting[]>>("/admin/configs/platform").then(r => r.data);

export const upsertPlatformSetting = (payload: UpsertPlatformPayload) =>
  request<ApiData<PlatformSetting>>("/admin/configs/platform", { method: "POST", body: JSON.stringify(payload) }).then(r => r.data);

// ── Admin Logs — Notifications ───────────────────────────────────────────

export const getNotificationLogs = (page = 1, limit = 20, status?: string) => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (status) params.set("status", status);
  return request<ApiData<NotificationLogsResponse>>(`/admin/logs/notifications?${params}`).then(r => r.data);
};

// ── Admin Broadcast ──────────────────────────────────────────────────────

export const broadcastNotification = (payload: BroadcastPayload) =>
  request<ApiData<BroadcastResult>>("/admin/notifications/broadcast", { method: "POST", body: JSON.stringify(payload) }).then(r => r.data);

// ── Admin Moderation ─────────────────────────────────────────────────────

export const getEventQueue = () =>
  request<ApiData<PendingEvent[]>>("/admin/events/queue").then(r => r.data);

export const approveEvent = (eventId: string, payload: ApproveEventPayload) =>
  request<ApiData<ApproveEventResult>>(`/admin/events/${eventId}/approve`, { method: "PUT", body: JSON.stringify(payload) }).then(r => r.data);

// ── Admin Finance & Payouts ──────────────────────────────────────────────

export const getFinanceLedger = () =>
  request<ApiData<FinanceLedger>>("/admin/finance/ledger").then(r => r.data);

export const payoutHost = (hostId: string) =>
  request<ApiData<PayoutResult>>(`/admin/finance/payouts/${hostId}`, { method: "PUT" }).then(r => r.data);

// ── Admin KYC Review ─────────────────────────────────────────────────────

export const getAllHosts = (kycStatus?: string) => {
  const params = new URLSearchParams();
  if (kycStatus) params.set("kycStatus", kycStatus);
  const query = params.toString() ? `?${params.toString()}` : "";
  return request<ApiData<HostsResponse>>(`/admin/hosts${query}`).then(r => r.data);
};

export const getPendingKycHosts = () =>
  request<ApiData<HostsResponse>>("/admin/hosts/kyc/pending").then(r => r.data);

export const reviewKyc = (hostProfileId: string, payload: KycReviewPayload) =>
  request<ApiData<KycReviewResult>>(`/admin/hosts/${hostProfileId}/kyc`, { method: "PUT", body: JSON.stringify(payload) }).then(r => r.data);
