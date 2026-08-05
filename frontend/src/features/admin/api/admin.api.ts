import { request } from "@/features/auth/api/client";
import type {
  IntegrationConfig, UpdateIntegrationPayload,
  TwilioSetupPayload, SendgridSetupPayload, MetaWaSetupPayload, RazorpaySetupPayload,
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

export const payoutHost = (
  hostId: string,
  mode: "AUTOMATIC" | "MANUAL" = "AUTOMATIC",
  manualRef?: string
) =>
  request<ApiData<PayoutResult>>(`/admin/finance/payouts/${hostId}`, {
    method: "PUT",
    body: JSON.stringify({ mode, manualRef }),
  }).then((r) => r.data);

// ── Admin KYC Review ─────────────────────────────────────────────────────

export const getAllHosts = (kycStatus?: string, page?: number, limit?: number) => {
  const params = new URLSearchParams();
  if (kycStatus) params.set("kycStatus", kycStatus);
  if (page) params.set("page", String(page));
  if (limit) params.set("limit", String(limit));
  const query = params.toString() ? `?${params.toString()}` : "";
  return request<ApiData<HostsResponse>>(`/admin/hosts${query}`).then(r => r.data);
};

export const getPendingKycHosts = () =>
  request<ApiData<HostsResponse>>("/admin/hosts/kyc/pending").then(r => r.data);

export const reviewKyc = (hostProfileId: string, payload: KycReviewPayload) =>
  request<ApiData<KycReviewResult>>(`/admin/hosts/${hostProfileId}/kyc`, { method: "PUT", body: JSON.stringify(payload) }).then(r => r.data);

export const deleteHost = (hostId: string) =>
  request<ApiData<any>>(`/admin/hosts/${hostId}`, { method: "DELETE" }).then(r => r.data);

export const notifyHost = (hostId: string, payload: { subject: string; bodyContent: string }) =>
  request<ApiData<any>>(`/admin/hosts/${hostId}/notify`, { method: "POST", body: JSON.stringify(payload) }).then(r => r.data);

export const declineEvent = (eventId: string) =>
  request<ApiData<any>>(`/admin/events/${eventId}/decline`, { method: "PUT" }).then(r => r.data);

export const getRefundRequests = (page?: number, limit?: number) => {
  const params = new URLSearchParams();
  if (page) params.set("page", String(page));
  if (limit) params.set("limit", String(limit));
  const query = params.toString() ? `?${params.toString()}` : "";
  return request<ApiData<any>>(`/admin/finance/refund-requests${query}`).then(r => r.data);
};

export const getEditRequests = () =>
  request<ApiData<any[]>>("/admin/edit-requests").then(r => r.data);

export const approveEditRequest = (id: string) =>
  request<ApiData<any>>(`/admin/edit-requests/${id}/approve`, { method: "PUT" }).then(r => r.data);

export const rejectEditRequest = (id: string) =>
  request<ApiData<any>>(`/admin/edit-requests/${id}/reject`, { method: "PUT" }).then(r => r.data);

export const approveRefundRequest = (
  refundId: string,
  mode: "AUTOMATIC" | "MANUAL" = "AUTOMATIC",
  manualRef?: string
) =>
  request<ApiData<any>>(`/admin/finance/refund-requests/${refundId}/approve`, {
    method: "PUT",
    body: JSON.stringify({ mode, manualRef }),
  }).then((r) => r.data);

export const getEventPayouts = (params?: { page?: number; limit?: number; payoutStatus?: string; eventStatus?: string; search?: string }) => {
  const q = new URLSearchParams();
  if (params?.page) q.set("page", String(params.page));
  if (params?.limit) q.set("limit", String(params.limit));
  if (params?.payoutStatus) q.set("payoutStatus", params.payoutStatus);
  if (params?.eventStatus) q.set("eventStatus", params.eventStatus);
  if (params?.search) q.set("search", params.search);
  return request<ApiData<any>>(`/admin/finance/event-payouts?${q.toString()}`).then((r) => r.data);
};

export const payoutEvent = (eventId: string, mode: "AUTOMATIC" | "MANUAL" = "MANUAL", manualRef?: string) =>
  request<ApiData<any>>(`/admin/finance/event-payouts/${eventId}/payout`, {
    method: "PUT",
    body: JSON.stringify({ mode, manualRef }),
  }).then((r) => r.data);

export const declineRefundRequest = (refundId: string) =>
  request<ApiData<any>>(`/admin/finance/refund-requests/${refundId}/decline`, { method: "PUT" }).then(r => r.data);

export const getBoostRequests = (page?: number, limit?: number) => {
  const params = new URLSearchParams();
  if (page) params.set("page", String(page));
  if (limit) params.set("limit", String(limit));
  const query = params.toString() ? `?${params.toString()}` : "";
  return request<ApiData<any>>(`/boosted-events/requests${query}`).then(r => r.data);
};

export const updateBoostStatus = (id: string, status: 'APPROVED' | 'REJECTED') =>
  request<ApiData<any>>(`/boosted-events/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }).then(r => r.data);
