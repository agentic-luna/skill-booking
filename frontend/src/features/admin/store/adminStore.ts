import { create } from "zustand";
import * as api from "@/features/admin/api/admin.api";
import type {
  IntegrationConfig, UpdateIntegrationPayload,
  TwilioSetupPayload, SendgridSetupPayload, MetaWaSetupPayload, RazorpaySetupPayload,
  PlatformSetting, UpsertPlatformPayload,
  NotificationLog, BroadcastPayload, BroadcastResult,
  PendingEvent, ApproveEventPayload, ApproveEventResult,
  FinanceLedger, PayoutResult,
  HostWithProfile, KycReviewPayload, KycReviewResult, PaginationMeta
} from "@/features/admin/api/types";

interface AdminState {
  // Loading & Error
  loading: boolean;
  error: string | null;

  // Integrations
  integrations: IntegrationConfig[];
  fetchIntegrations: () => Promise<void>;
  updateIntegration: (serviceName: string, payload: UpdateIntegrationPayload) => Promise<IntegrationConfig>;
  setupTwilio: (p: TwilioSetupPayload) => Promise<IntegrationConfig>;
  setupSendgrid: (p: SendgridSetupPayload) => Promise<IntegrationConfig>;
  setupMetaWa: (p: MetaWaSetupPayload) => Promise<IntegrationConfig>;
  setupRazorpay: (p: RazorpaySetupPayload) => Promise<IntegrationConfig>;

  // Platform settings
  platformSettings: PlatformSetting[];
  fetchPlatformSettings: () => Promise<void>;
  upsertPlatformSetting: (p: UpsertPlatformPayload) => Promise<PlatformSetting>;

  // Notification logs
  notificationLogs: NotificationLog[];
  logsTotal: number;
  logsPage: number;
  logsTotalPages: number;
  fetchNotificationLogs: (page?: number, limit?: number, status?: string) => Promise<void>;

  // Broadcast
  broadcastNotification: (payload: BroadcastPayload) => Promise<BroadcastResult>;

  // Moderation Event Queue
  eventQueue: PendingEvent[];
  fetchEventQueue: () => Promise<void>;
  approveEvent: (eventId: string, payload: ApproveEventPayload) => Promise<ApproveEventResult>;
  declineEvent: (eventId: string) => Promise<any>;
  resolveRefund: (refundId: string, action: "approve" | "decline") => Promise<any>;

  // Edit Requests
  editRequests: any[];
  fetchEditRequests: () => Promise<void>;
  approveEditRequest: (id: string) => Promise<any>;
  rejectEditRequest: (id: string) => Promise<any>;

  // Finance & Ledger
  financeLedger: FinanceLedger | null;
  refundRequests: any[];
  refundsPagination: PaginationMeta | null;
  boostRequests: any[];
  boostsPagination: PaginationMeta | null;
  hostsPagination: PaginationMeta | null;
  fetchFinanceLedger: () => Promise<void>;
  payoutHost: (hostId: string, mode?: "AUTOMATIC" | "MANUAL", manualRef?: string) => Promise<PayoutResult>;
  fetchRefundRequests: (page?: number, limit?: number) => Promise<void>;
  fetchBoostRequests: (page?: number, limit?: number) => Promise<void>;
  approveRefund: (id: string) => Promise<any>;
  declineRefund: (id: string) => Promise<any>;

  // KYC & Host Review
  hosts: HostWithProfile[];
  pendingKycHosts: HostWithProfile[];
  fetchHosts: (kycStatus?: string, page?: number, limit?: number) => Promise<void>;
  fetchPendingKycHosts: () => Promise<void>;
  reviewKyc: (hostProfileId: string, payload: KycReviewPayload) => Promise<KycReviewResult>;
  deleteHost: (hostId: string) => Promise<any>;
  notifyHost: (hostId: string, subject: string, bodyContent: string) => Promise<any>;

  clearError: () => void;
}

// ── Helper for wrapping async actions ────────────────────────────────────

function withLoading<T>(
  set: (partial: Partial<AdminState>) => void,
  fn: () => Promise<T>
): Promise<T> {
  set({ loading: true, error: null });
  return fn()
    .then((result) => { set({ loading: false }); return result; })
    .catch((e: any) => { set({ error: e.message, loading: false }); throw e; });
}

// ── Store ────────────────────────────────────────────────────────────────

export const useAdminStore = create<AdminState>((set, get) => ({
  loading: false,
  error: null,

  // ── Integrations ──────────────────────────────────────────────────────

  integrations: [],

  fetchIntegrations: () => withLoading(set, async () => {
    const integrations = await api.getIntegrationConfigs();
    set({ integrations });
  }),

  updateIntegration: (serviceName, payload) => withLoading(set, async () => {
    const updated = await api.updateIntegrationConfig(serviceName, payload);
    set({ integrations: get().integrations.map((c) => c.serviceName === serviceName ? updated : c) });
    return updated;
  }),

  setupTwilio: (p) => withLoading(set, async () => {
    const config = await api.setupTwilio(p);
    await get().fetchIntegrations();
    return config;
  }),

  setupSendgrid: (p) => withLoading(set, async () => {
    const config = await api.setupSendgrid(p);
    await get().fetchIntegrations();
    return config;
  }),

  setupMetaWa: (p) => withLoading(set, async () => {
    const config = await api.setupMetaWa(p);
    await get().fetchIntegrations();
    return config;
  }),

  setupRazorpay: (p) => withLoading(set, async () => {
    const config = await api.setupRazorpay(p);
    await get().fetchIntegrations();
    return config;
  }),

  // ── Platform Settings ──────────────────────────────────────────────────

  platformSettings: [],

  fetchPlatformSettings: () => withLoading(set, async () => {
    const platformSettings = await api.getPlatformSettings();
    set({ platformSettings });
  }),

  upsertPlatformSetting: (p) => withLoading(set, async () => {
    const setting = await api.upsertPlatformSetting(p);
    const existing = get().platformSettings;
    const idx = existing.findIndex((s) => s.key === setting.key);
    if (idx >= 0) {
      existing[idx] = setting;
      set({ platformSettings: [...existing] });
    } else {
      set({ platformSettings: [...existing, setting] });
    }
    return setting;
  }),

  // ── Notification Logs ──────────────────────────────────────────────────

  notificationLogs: [],
  logsTotal: 0,
  logsPage: 1,
  logsTotalPages: 1,

  fetchNotificationLogs: (page = 1, limit = 20, status?) => withLoading(set, async () => {
    const result = await api.getNotificationLogs(page, limit, status);
    set({
      notificationLogs: result.logs,
      logsTotal: result.total,
      logsPage: result.page,
      logsTotalPages: result.totalPages,
    });
  }),

  // ── Broadcast ──────────────────────────────────────────────────────────

  broadcastNotification: (payload) => withLoading(set, () => api.broadcastNotification(payload)),

  // ── Moderation Event Queue ─────────────────────────────────────────────

  eventQueue: [],

  fetchEventQueue: () => withLoading(set, async () => {
    const queue = await api.getEventQueue();
    set({ eventQueue: queue });
  }),

  approveEvent: (eventId, payload) => withLoading(set, async () => {
    const result = await api.approveEvent(eventId, payload);
    set({ eventQueue: get().eventQueue.filter((e) => e.id !== eventId) });
    return result;
  }),

  declineEvent: (eventId) => withLoading(set, async () => {
    const result = await api.declineEvent(eventId);
    set({ eventQueue: get().eventQueue.filter((e) => e.id !== eventId) });
    return result;
  }),

  resolveRefund: (refundId, action) => withLoading(set, async () => {
    const result = action === "approve"
      ? await api.approveRefundRequest(refundId)
      : await api.declineRefundRequest(refundId);
    await get().fetchRefundRequests();
    return result;
  }),

  // ── Finance & Ledger ───────────────────────────────────────────────────

  financeLedger: null,

  fetchFinanceLedger: () => withLoading(set, async () => {
    const ledger = await api.getFinanceLedger();
    set({ financeLedger: ledger });
  }),

  payoutHost: (hostId, mode, manualRef) => withLoading(set, async () => {
    const result = await api.payoutHost(hostId, mode, manualRef);
    // Refresh ledger after payout release
    await get().fetchFinanceLedger();
    return result;
  }),

  refundRequests: [],
  refundsPagination: null,

  fetchRefundRequests: (page = 1, limit = 10) => withLoading(set, async () => {
    const res: any = await api.getRefundRequests(page, limit);
    if (res && res.pagination) {
      set({ refundRequests: res.data || [], refundsPagination: res.pagination });
    } else {
      const items = Array.isArray(res) ? res : res?.data || [];
      set({ refundRequests: items, refundsPagination: null });
    }
  }),

  boostRequests: [],
  boostsPagination: null,

  fetchBoostRequests: (page = 1, limit = 10) => withLoading(set, async () => {
    const res: any = await api.getBoostRequests(page, limit);
    if (res && res.pagination) {
      set({ boostRequests: res.data || [], boostsPagination: res.pagination });
    } else {
      const items = Array.isArray(res) ? res : res?.data || [];
      set({ boostRequests: items, boostsPagination: null });
    }
  }),

  approveRefund: (id) => withLoading(set, async () => {
    const result = await api.approveRefundRequest(id);
    await get().fetchRefundRequests();
    return result;
  }),

  declineRefund: (id) => withLoading(set, async () => {
    const result = await api.declineRefundRequest(id);
    await get().fetchRefundRequests();
    return result;
  }),

  // ── KYC & Host Review ──────────────────────────────────────────────────

  hosts: [],
  hostsPagination: null,
  pendingKycHosts: [],

  fetchHosts: (kycStatus, page = 1, limit = 10) => withLoading(set, async () => {
    const response: any = await api.getAllHosts(kycStatus, page, limit);
    set({
      hosts: response.hosts || response.data || [],
      hostsPagination: response.pagination || null,
    });
  }),

  fetchPendingKycHosts: () => withLoading(set, async () => {
    const response = await api.getPendingKycHosts();
    set({ pendingKycHosts: response.hosts });
  }),

  reviewKyc: (hostProfileId, payload) => withLoading(set, async () => {
    const result = await api.reviewKyc(hostProfileId, payload);
    // Refresh list states
    await get().fetchPendingKycHosts();
    await get().fetchHosts();
    return result;
  }),

  deleteHost: (hostId) => withLoading(set, async () => {
    const result = await api.deleteHost(hostId);
    set({ hosts: get().hosts.filter((h) => h.id !== hostId) });
    return result;
  }),

  notifyHost: (hostId, subject, bodyContent) => withLoading(set, async () => {
    const result = await api.notifyHost(hostId, { subject, bodyContent });
    return result;
  }),

  // ── Edit Requests ──────────────────────────────────────────────────────

  editRequests: [],

  fetchEditRequests: () => withLoading(set, async () => {
    const requests = await api.getEditRequests();
    set({ editRequests: requests });
  }),

  approveEditRequest: (id) => withLoading(set, async () => {
    const result = await api.approveEditRequest(id);
    set({ editRequests: get().editRequests.filter((r) => r.id !== id) });
    return result;
  }),

  rejectEditRequest: (id) => withLoading(set, async () => {
    const result = await api.rejectEditRequest(id);
    set({ editRequests: get().editRequests.filter((r) => r.id !== id) });
    return result;
  }),

  clearError: () => set({ error: null }),
}));
