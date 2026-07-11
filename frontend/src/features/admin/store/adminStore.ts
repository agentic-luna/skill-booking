import { create } from "zustand";
import * as api from "@/features/admin/api/admin.api";
import type {
  IntegrationConfig, UpdateIntegrationPayload,
  TwilioSetupPayload, SendgridSetupPayload, MetaWaSetupPayload, RazorpaySetupPayload,
  MessageTemplate, UpdateTemplatePayload,
  PlatformSetting, UpsertPlatformPayload,
  NotificationLog, BroadcastPayload, BroadcastResult,
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

  // Templates
  templates: MessageTemplate[];
  fetchTemplates: () => Promise<void>;
  updateTemplate: (id: string, payload: UpdateTemplatePayload) => Promise<MessageTemplate>;

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

  // ── Templates ──────────────────────────────────────────────────────────

  templates: [],

  fetchTemplates: () => withLoading(set, async () => {
    const templates = await api.getTemplates();
    set({ templates });
  }),

  updateTemplate: (id, payload) => withLoading(set, async () => {
    const updated = await api.updateTemplate(id, payload);
    set({ templates: get().templates.map((t) => t.id === id ? updated : t) });
    return updated;
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

  clearError: () => set({ error: null }),
}));
