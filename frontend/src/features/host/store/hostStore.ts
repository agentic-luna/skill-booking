import { create } from "zustand";
import * as hostApi from "@/features/host/api/host.api";
import type {
  SubmitKycPayload,
  KycResponse,
  BankDetailsPayload,
  BankDetailsResponse,
  CreateEventPayload,
  CreatedEvent,
  DashboardStats,
} from "@/features/host/api/types";

// ── Store State Interface ─────────────────────────────────────────────────

interface HostState {
  // Shared loading / error
  isLoading: boolean;
  error: string | null;

  // KYC
  kyc: KycResponse | null;
  submitKyc: (payload: SubmitKycPayload) => Promise<KycResponse>;

  // Bank details
  bankDetails: BankDetailsResponse | null;
  submitBankDetails: (payload: BankDetailsPayload) => Promise<BankDetailsResponse>;
  updateBankDetails: (payload: BankDetailsPayload) => Promise<BankDetailsResponse>;

  // Events
  latestCreatedEvent: CreatedEvent | null;
  createEvent: (payload: CreateEventPayload) => Promise<CreatedEvent>;

  // Dashboard
  dashboard: DashboardStats | null;
  dashboardLoading: boolean;
  fetchDashboard: () => Promise<void>;

  // Utilities
  clearError: () => void;
}

// ── Store ─────────────────────────────────────────────────────────────────

export const useHostStore = create<HostState>((set) => ({
  isLoading: false,
  error: null,
  kyc: null,
  bankDetails: null,
  latestCreatedEvent: null,
  dashboard: null,
  dashboardLoading: false,

  // ── KYC ────────────────────────────────────────────────────────────────

  submitKyc: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const kyc = await hostApi.submitKyc(payload);
      set({ kyc, isLoading: false });
      return kyc;
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
      throw e;
    }
  },

  // ── Bank Details ────────────────────────────────────────────────────────

  submitBankDetails: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const bankDetails = await hostApi.submitBankDetails(payload);
      set({ bankDetails, isLoading: false });
      return bankDetails;
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
      throw e;
    }
  },

  updateBankDetails: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const bankDetails = await hostApi.updateBankDetails(payload);
      set({ bankDetails, isLoading: false });
      return bankDetails;
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
      throw e;
    }
  },

  // ── Events ──────────────────────────────────────────────────────────────

  createEvent: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const event = await hostApi.createEvent(payload);
      set({ latestCreatedEvent: event, isLoading: false });
      return event;
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
      throw e;
    }
  },

  // ── Dashboard ────────────────────────────────────────────────────────────

  fetchDashboard: async () => {
    set({ dashboardLoading: true, error: null });
    try {
      const dashboard = await hostApi.getHostDashboard();
      set({ dashboard, dashboardLoading: false });
    } catch (e: any) {
      set({ error: e.message, dashboardLoading: false });
    }
  },

  // ── Utilities ────────────────────────────────────────────────────────────

  clearError: () => set({ error: null }),
}));
