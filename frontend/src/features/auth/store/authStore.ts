import { create } from "zustand";
import * as authApi from "@/features/auth/api/authApi";
import type { AuthState, User } from "./auth.types";
import { mapApiUser } from "./auth.types";
import {
  saveTokens,
  clearTokens,
  saveSession,
  getRefreshToken,
} from "./auth.helpers";

export type { UserRole, User, PendingRegistration } from "./auth.types";

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  pendingRegistration: null,
  isVerifying: false,
  pendingUser: null,

  startRegistration: async ({ firstName, lastName, email, phone, password, role }) => {
    set({ isLoading: true, error: null });
    try {
      await Promise.all([authApi.sendOtp(email, "EMAIL"), authApi.sendOtp(phone, "PHONE")]);
      set({
        pendingRegistration: {
          firstName, lastName, email, phone, password,
          role: role.toUpperCase() as "CLIENT" | "HOST",
          emailOtpSent: true, phoneOtpSent: true,
          emailVerified: false, phoneVerified: false,
        },
        isVerifying: true,
        isLoading: false,
      });
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
      throw e;
    }
  },

  verifyEmailOtp: async (otp) => {
    const { pendingRegistration } = get();
    if (!pendingRegistration) throw new Error("No pending registration");
    set({ isLoading: true, error: null });
    try {
      await authApi.verifyOtp(pendingRegistration.email, "EMAIL", otp);
      set((s) => ({
        pendingRegistration: s.pendingRegistration
          ? { ...s.pendingRegistration, emailVerified: true }
          : null,
        isLoading: false,
      }));
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
      throw e;
    }
  },

  verifyPhoneOtpAndSignup: async (otp) => {
    const { pendingRegistration } = get();
    if (!pendingRegistration) throw new Error("No pending registration");
    set({ isLoading: true, error: null });
    try {
      await authApi.verifyOtp(pendingRegistration.phone, "PHONE", otp);
      const response = await authApi.signup({
        firstName: pendingRegistration.firstName,
        lastName: pendingRegistration.lastName,
        email: pendingRegistration.email,
        phone: pendingRegistration.phone,
        password: pendingRegistration.password,
        role: pendingRegistration.role,
      });
      const user = mapApiUser(response.user);
      saveTokens(response.accessToken, response.refreshToken);
      saveSession(user);
      set({ user, isAuthenticated: true, isVerifying: false, pendingRegistration: null, pendingUser: null, isLoading: false });
      return user;
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
      throw e;
    }
  },

  verifyOtp: async (code) => {
    const { pendingRegistration } = get();
    if (!pendingRegistration) return false;
    try {
      if (!pendingRegistration.emailVerified) {
        await get().verifyEmailOtp(code);
        return true;
      }
      await get().verifyPhoneOtpAndSignup(code);
      return true;
    } catch {
      return false;
    }
  },

  login: async (identifier, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.login(identifier, password);
      const user = mapApiUser(response.user);
      saveTokens(response.accessToken, response.refreshToken);
      saveSession(user);
      set({ user, isAuthenticated: true, isLoading: false });
      return user;
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
      throw e;
    }
  },

  forgotPassword: async (identifier) => {
    set({ isLoading: true, error: null });
    try {
      await authApi.forgotPasswordSendOtp(identifier);
      set({ isLoading: false });
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
      throw e;
    }
  },

  forgotPasswordVerifyOtp: async (identifier, otp) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authApi.forgotPasswordVerifyOtp(identifier, otp);
      set({ isLoading: false });
      return res.resetToken;
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
      throw e;
    }
  },

  resetPassword: async (resetToken, newPassword) => {
    set({ isLoading: true, error: null });
    try {
      await authApi.resetPassword(resetToken, newPassword);
      set({ isLoading: false });
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
      throw e;
    }
  },

  logout: async () => {
    const token = getRefreshToken();
    try {
      if (token) await authApi.logoutApi(token);
    } catch { /* fail silently */ } finally {
      clearTokens();
      set({ user: null, isAuthenticated: false, isVerifying: false, pendingRegistration: null, pendingUser: null });
    }
  },

  updateProfile: (updates) => {
    set((state) => {
      if (!state.user) return state;
      const updatedUser = { ...state.user, ...updates } as User;
      saveSession(updatedUser);
      return { user: updatedUser };
    });
  },

  clearError: () => set({ error: null }),
}));

// ── Session rehydration ───────────────────────────────────────────────────

export const initAuth = async () => {
  if (typeof window === "undefined") return;
  const token = localStorage.getItem("bms_access_token");
  if (!token) return;
  const apiUser = await authApi.getMe();
  if (apiUser) {
    const user = mapApiUser(apiUser);
    saveSession(user);
    useAuthStore.setState({ user, isAuthenticated: true });
  } else {
    clearTokens();
  }
};
