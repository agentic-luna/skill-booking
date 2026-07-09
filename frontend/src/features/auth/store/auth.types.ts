// ── Store-level types for the auth feature ────────────────────────────────

import type { AuthUser } from "@/features/auth/api/types";

export type UserRole = "client" | "host" | "admin";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  /** Convenience: firstName + " " + lastName */
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: "ACTIVE" | "SUSPENDED";
  avatarUrl?: string;
}

/** Transient state while user is going through the registration wizard */
export interface PendingRegistration {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  role: "CLIENT" | "HOST";
  emailOtpSent: boolean;
  phoneOtpSent: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  pendingRegistration: PendingRegistration | null;
  /** true while user is in the OTP verification steps */
  isVerifying: boolean;
  /** kept for backward compat with /verify page */
  pendingUser: User | null;

  startRegistration: (data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    role: "client" | "host";
  }) => Promise<void>;
  verifyEmailOtp: (otp: string) => Promise<void>;
  verifyPhoneOtpAndSignup: (otp: string) => Promise<User>;
  verifyOtp: (code: string) => Promise<boolean>;
  login: (identifier: string, password: string) => Promise<User>;
  forgotPassword: (identifier: string) => Promise<void>;
  forgotPasswordVerifyOtp: (identifier: string, otp: string) => Promise<string>;
  resetPassword: (resetToken: string, newPassword: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => void;
  clearError: () => void;
}

// ── mapApiUser helper (shared between store and initAuth) ─────────────────

export function mapApiUser(u: AuthUser): User {
  return {
    id: u.id,
    firstName: u.firstName,
    lastName: u.lastName,
    name: `${u.firstName} ${u.lastName}`,
    email: u.email,
    phone: u.phone,
    role:
      u.role === "SUPERADMIN" ? "admin" : (u.role.toLowerCase() as UserRole),
    status: u.status,
  };
}
