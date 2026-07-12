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
  isInitialized: false,
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

  adminLogin: async (identifier, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.adminLogin(identifier, password);
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

      return res.data.resetToken;

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

// Helper to decode JWT payload safely client-side
function decodeJwt(token: string): any {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

// ── Session rehydration ───────────────────────────────────────────────────

export const initAuth = async () => {
  if (typeof window === "undefined") return;
  const token = localStorage.getItem("bms_access_token");
  if (!token) {
    useAuthStore.setState({ isInitialized: true });
    return;
  }
  try {
    // 1. Try to read the user session from localStorage first to avoid API call traffic
    const sessionStr = localStorage.getItem("bookmyskill_session");
    let user = null;
    if (sessionStr) {
      user = JSON.parse(sessionStr);
    } else {
      // 2. Decode user info from the JWT token directly
      const decoded = decodeJwt(token);
      if (decoded) {
        user = {
          id: decoded.id,
          email: decoded.email,
          role: decoded.role === "SUPERADMIN" ? "admin" : decoded.role?.toLowerCase(),
          firstName: "",
          lastName: "",
          name: "",
          phone: "",
          status: "ACTIVE",
          hostProfile: null,
        };
      }
    }

    if (user) {
      useAuthStore.setState({ user, isAuthenticated: true });

      // 3. Fallback: If user is logged in but hostProfile is missing, fetch once asynchronously in the background
      if (user.role === "host" && !user.hostProfile) {
        authApi.getMe().then((apiUser) => {
          if (apiUser) {
            const fullUser = mapApiUser(apiUser);
            saveSession(fullUser);
            useAuthStore.setState({ user: fullUser });
          }
        }).catch(() => {});
      }
    } else {
      // Fetch user from backend if both session and JWT decoding failed
      const apiUser = await authApi.getMe();
      if (apiUser) {
        const fullUser = mapApiUser(apiUser);
        saveSession(fullUser);
        useAuthStore.setState({ user: fullUser, isAuthenticated: true });
      } else {
        clearTokens();
      }
    }
  } catch (e) {
    clearTokens();
  } finally {
    useAuthStore.setState({ isInitialized: true });
  }
};
