// ── Store-level types for the auth feature ────────────────────────────────

import type { AuthUser } from "@/features/auth/api/types";

export type UserRole = "client" | "host" | "admin";

export interface HostProfile {
  id: string;
  userId: string;
  accountType: string;
  govIdUrl?: string | null;
  gstNumber?: string | null;
  kycStatus: "PENDING" | "APPROVED" | "REJECTED";
  bio?: string | null;
  bankDetail?: {
    id: string;
    bankName: string;
  } | null;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  /** Convenience: firstName + " " + lastName */
  name: string;
  email: string;
  phone: string;
  isEmailVerified?: boolean;
  role: UserRole;
  status: "ACTIVE" | "SUSPENDED";
  avatarUrl?: string;
  hostProfile?: HostProfile | null;
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
  /** DEV ONLY — returned by backend in development/test mode */
  devEmailOtp?: string;
  /** DEV ONLY — returned by backend in development/test mode */
  devPhoneOtp?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
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
  adminLogin: (identifier: string, password: string) => Promise<User>;
  forgotPassword: (identifier: string) => Promise<string | undefined>;
  forgotPasswordVerifyOtp: (identifier: string, otp: string) => Promise<string>;
  resetPassword: (resetToken: string, newPassword: string) => Promise<void>;
  clientSignup: (data: {
    firstName: string;
    lastName: string;
    phone: string;
    password: string;
    otp?: string;
  }) => Promise<User>;
  clientSendOtp: (phone: string) => Promise<any>;
  clientVerifyOtp: (phone: string, otp: string) => Promise<any>;
  sendEmailMagicLink: (email: string) => Promise<any>;
  verifyEmailMagicLink: (token: string) => Promise<any>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => void;
  refreshUser: () => Promise<User | undefined>;
  clearError: () => void;
}

// ── mapApiUser helper (shared between store and initAuth) ─────────────────

export function mapApiUser(u: any): User {
  return {
    id: u.id,
    firstName: u.firstName,
    lastName: u.lastName,
    name: `${u.firstName} ${u.lastName}`,
    email: u.email,
    phone: u.phone,
    isEmailVerified: u.isEmailVerified ?? (!!u.email && u.role !== "CLIENT"),
    role:
      u.role === "SUPERADMIN" ? "admin" : (u.role.toLowerCase() as UserRole),
    status: u.status,
    hostProfile: u.hostProfile || null,
  };
}
