import { create } from "zustand";
import * as hostApi from "@/features/host/api/host.api";
import { useAuthStore } from "@/features/auth/store/authStore";
import { saveSession } from "@/features/auth/store/auth.helpers";
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
  bankDetails: any | null;
  submitBankDetails: (payload: BankDetailsPayload) => Promise<BankDetailsResponse>;
  updateBankDetails: (payload: BankDetailsPayload) => Promise<BankDetailsResponse>;
  fetchBankDetails: () => Promise<void>;

  // Events
  latestCreatedEvent: CreatedEvent | null;
  createEvent: (payload: CreateEventPayload) => Promise<CreatedEvent>;
  requestBoost: (eventId: string, durationDays: number) => Promise<any>;
  verifyBoostPayment: (payload: { boostId: string, razorpayPaymentId: string, razorpayOrderId: string, razorpaySignature: string }) => Promise<any>;
  updateEvent: (id: string, payload: any) => Promise<any>;
  deleteEvent: (id: string) => Promise<any>;
  requestEditAccess: (eventId: string, reason?: string) => Promise<any>;
  myEvents: any[];
  fetchMyEvents: () => Promise<void>;
  
  boostPricing: Record<string, number> | null;
  fetchBoostPricing: () => Promise<void>;

  // Roster Board
  participants: any[];
  fetchParticipants: () => Promise<void>;
  eventBookings: Record<string, any[]>;
  fetchEventBookings: (eventId: string) => Promise<void>;

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
  myEvents: [],
  boostPricing: null,
  participants: [],
  eventBookings: {},
  dashboard: null,
  dashboardLoading: false,

  // ── KYC ────────────────────────────────────────────────────────────────

  submitKyc: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const kyc = await hostApi.submitKyc(payload);
      set({ kyc, isLoading: false });

      // Sync changes with authStore and localStorage
      const authUser = useAuthStore.getState().user;
      if (authUser) {
        const updatedUser = {
          ...authUser,
          hostProfile: {
            ...(authUser.hostProfile || {}),
            ...kyc,
          },
        } as any;
        useAuthStore.setState({ user: updatedUser });
        saveSession(updatedUser);
      }

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

      // Sync changes with authStore and localStorage
      const authUser = useAuthStore.getState().user;
      if (authUser) {
        const updatedUser = {
          ...authUser,
          hostProfile: {
            ...(authUser.hostProfile || {}),
            bankDetail: bankDetails,
          },
        } as any;
        useAuthStore.setState({ user: updatedUser });
        saveSession(updatedUser);
      }

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

      // Sync changes with authStore and localStorage
      const authUser = useAuthStore.getState().user;
      if (authUser) {
        const updatedUser = {
          ...authUser,
          hostProfile: {
            ...(authUser.hostProfile || {}),
            bankDetail: bankDetails,
          },
        } as any;
        useAuthStore.setState({ user: updatedUser });
        saveSession(updatedUser);
      }

      return bankDetails;
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
      throw e;
    }
  },

  fetchBankDetails: async () => {
    set({ isLoading: true, error: null });
    try {
      const bankDetails = await hostApi.getBankDetails();
      set({ bankDetails, isLoading: false });
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
    }
  },

  // ── Events ──────────────────────────────────────────────────────────────

  verifyBoostPayment: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const response = await hostApi.verifyBoostPayment(payload);
      set({ isLoading: false });
      return response;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to verify boost payment';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },
  requestBoost: async (eventId, durationDays) => {
    set({ isLoading: true, error: null });
    try {
      const response = await hostApi.requestBoost(eventId, durationDays);
      set({ isLoading: false });
      return response;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to request boost';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },
  fetchBoostPricing: async () => {
    try {
      const pricing = await hostApi.getBoostPricing();
      set({ boostPricing: pricing });
    } catch (error: any) {
      console.error("Failed to fetch boost pricing", error);
    }
  },
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

  requestEditAccess: async (eventId, reason) => {
    set({ isLoading: true, error: null });
    try {
      const data = await hostApi.requestEditAccess(eventId, reason);
      set({ isLoading: false });
      return data;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  updateEvent: async (id, payload) => {
    set({ isLoading: true, error: null });
    try {
      const event = await hostApi.updateEvent(id, payload);
      set((state) => ({
        myEvents: state.myEvents.map((e) => (e.id === id ? event : e)),
        isLoading: false,
      }));
      return event;
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
      throw e;
    }
  },

  deleteEvent: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const res = await hostApi.deleteEvent(id);
      set((state) => ({
        myEvents: state.myEvents.filter((e) => e.id !== id),
        isLoading: false,
      }));
      return res;
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
      throw e;
    }
  },

  fetchMyEvents: async () => {
    set({ isLoading: true, error: null });
    try {
      const myEvents = await hostApi.getMyEvents();
      set({ myEvents, isLoading: false });
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
    }
  },

  fetchParticipants: async () => {
    set({ isLoading: true, error: null });
    try {
      const participants = await hostApi.getHostParticipants();
      set({ participants, isLoading: false });
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
    }
  },

  fetchEventBookings: async (eventId) => {
    set({ isLoading: true, error: null });
    try {
      const bookings = await hostApi.getEventBookings(eventId);
      set((state) => ({
        eventBookings: {
          ...state.eventBookings,
          [eventId]: bookings,
        },
        isLoading: false,
      }));
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
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
