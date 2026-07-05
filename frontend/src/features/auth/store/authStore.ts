import { create } from "zustand";

export type UserRole = "client" | "host" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  verified?: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isVerifying: boolean; // true if registering and waiting for OTP
  pendingUser: User | null; // store user details during OTP step
  isLoading: boolean;
  error: string | null;
  
  login: (email: string, role: UserRole) => Promise<User>;
  register: (name: string, email: string, role: UserRole) => Promise<User>;
  verifyOtp: (code: string) => Promise<boolean>;
  forgotPassword: (email: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isVerifying: false,
  pendingUser: null,
  isLoading: false,
  error: null,

  login: async (email: string, role: UserRole) => {
    set({ isLoading: true, error: null });
    await new Promise((resolve) => setTimeout(resolve, 800)); // Simulate API delay
    
    // Mock user database lookup
    const user: User = {
      id: `usr_${Math.random().toString(36).substr(2, 9)}`,
      name: email.split("@")[0].charAt(0).toUpperCase() + email.split("@")[0].slice(1),
      email,
      role,
      avatarUrl: `https://images.unsplash.com/photo-${role === "admin" ? "1472099645785-5658abf4ff4e" : role === "host" ? "1534528741775-53994a69daeb" : "1507003211169-0a1dd7228f2d"}?auto=format&fit=crop&q=80&w=120`,
      verified: true,
    };

    set({ user, isAuthenticated: true, isLoading: false });
    // Persist session to localstorage mock
    if (typeof window !== "undefined") {
      localStorage.setItem("bookmyskill_session", JSON.stringify(user));
    }
    return user;
  },

  register: async (name: string, email: string, role: UserRole) => {
    set({ isLoading: true, error: null });
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    const pendingUser: User = {
      id: `usr_${Math.random().toString(36).substr(2, 9)}`,
      name,
      email,
      role,
      avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120",
      verified: false,
    };

    set({ pendingUser, isVerifying: true, isLoading: false });
    return pendingUser;
  },

  verifyOtp: async (code: string) => {
    set({ isLoading: true, error: null });
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Simulate OTP Code matching "123456" or "1234"
    if (code === "123456" || code === "1234") {
      const { pendingUser } = get();
      if (pendingUser) {
        const verifiedUser = { ...pendingUser, verified: true };
        set({
          user: verifiedUser,
          isAuthenticated: true,
          isVerifying: false,
          pendingUser: null,
          isLoading: false,
        });
        if (typeof window !== "undefined") {
          localStorage.setItem("bookmyskill_session", JSON.stringify(verifiedUser));
        }
        return true;
      }
    }
    
    set({ error: "Invalid verification code. Use '123456' for mock verify.", isLoading: false });
    return false;
  },

  forgotPassword: async (email: string) => {
    set({ isLoading: true, error: null });
    await new Promise((resolve) => setTimeout(resolve, 800));
    set({ isLoading: false });
    return true; // Mock email successfully sent
  },

  logout: () => {
    set({ user: null, isAuthenticated: false, isVerifying: false, pendingUser: null });
    if (typeof window !== "undefined") {
      localStorage.removeItem("bookmyskill_session");
    }
  },

  updateProfile: (updates: Partial<User>) => {
    set((state) => {
      if (!state.user) return state;
      const updatedUser = { ...state.user, ...updates };
      if (typeof window !== "undefined") {
        localStorage.setItem("bookmyskill_session", JSON.stringify(updatedUser));
      }
      return { user: updatedUser };
    });
  },

  clearError: () => set({ error: null }),
}));

// Client-side initialization helper to rehydrate session
export const initAuth = () => {
  if (typeof window !== "undefined") {
    const session = localStorage.getItem("bookmyskill_session");
    if (session) {
      try {
        const user = JSON.parse(session);
        useAuthStore.setState({ user, isAuthenticated: true });
      } catch (e) {
        localStorage.removeItem("bookmyskill_session");
      }
    }
  }
};
