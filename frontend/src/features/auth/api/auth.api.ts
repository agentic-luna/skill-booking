import { request } from "./client";
import type {
  AuthResponse,
  AuthUser,
  SignupPayload,
  ForgotPasswordSendResponse,
  ForgotPasswordVerifyResponse,
  ResetPasswordResponse,
} from "./types";

// ── Signup / Login ────────────────────────────────────────────────────────

/** POST /auth/signup — Register new user account */
export async function signup(data: SignupPayload): Promise<AuthResponse> {
  const res = await request<{ success: boolean; data: AuthResponse }>(
    "/auth/signup",
    { method: "POST", body: JSON.stringify(data) }
  );
  return res.data;
}

export interface ClientSignupPayload {
  firstName: string;
  lastName: string;
  phone: string;
  password: string;
  otp?: string;
}

/** POST /auth/client/signup — Register client account via WhatsApp number */
export async function clientSignup(data: ClientSignupPayload): Promise<AuthResponse> {
  const res = await request<{ success: boolean; data: AuthResponse }>(
    "/auth/client/signup",
    { method: "POST", body: JSON.stringify(data) }
  );
  return res.data;
}

/** POST /auth/client/email/send-verification — Send magic link email to client */
export async function sendEmailMagicLink(email: string): Promise<{ message: string; magicLink?: string; token?: string }> {
  const res = await request<{ success: boolean; data: { message: string; magicLink?: string; token?: string } }>(
    "/auth/client/email/send-verification",
    { method: "POST", body: JSON.stringify({ email }) }
  );
  return res.data;
}

/** POST /auth/client/email/verify-link — Verify magic link token */
export async function verifyEmailMagicLink(token: string): Promise<{ message: string; user: AuthUser }> {
  const res = await request<{ success: boolean; data: { message: string; user: AuthUser } }>(
    "/auth/client/email/verify-link",
    { method: "POST", body: JSON.stringify({ token }) }
  );
  return res.data;
}

/** POST /auth/login — Login with email or phone + password */
export async function login(
  identifier: string,
  password: string
): Promise<AuthResponse> {
  const res = await request<{ success: boolean; data: AuthResponse }>(
    "/auth/login",
    { method: "POST", body: JSON.stringify({ identifier, password }) }
  );
  return res.data;
}

/** POST /admin/login — Login with email or username + password for administrators */
export async function adminLogin(
  identifier: string,
  password: string
): Promise<AuthResponse> {
  const res = await request<{ success: boolean; data: AuthResponse }>(
    "/admin/login",
    { method: "POST", body: JSON.stringify({ identifier, password }) }
  );
  return res.data;
}

// ── Session management ────────────────────────────────────────────────────

/** POST /auth/refresh — Rotate tokens */
export async function refreshToken(token: string): Promise<AuthResponse> {
  const res = await request<{ success: boolean; data: AuthResponse }>(
    "/auth/refresh",
    { method: "POST", body: JSON.stringify({ refreshToken: token }) }
  );
  return res.data;
}

/** POST /auth/logout — Revoke refresh token */
export async function logoutApi(token: string): Promise<void> {
  await request("/auth/logout", {
    method: "POST",
    body: JSON.stringify({ refreshToken: token }),
  });
}

/** GET /auth/me — Get current authenticated user */
export async function getMe(): Promise<AuthUser | null> {
  try {
    const res = await request<{ success: boolean; data: AuthUser }>("/auth/me");
    return res.data;
  } catch {
    return null;
  }
}

// ── Forgot password flow ──────────────────────────────────────────────────

/** POST /auth/forgot-password/send-otp */
export async function forgotPasswordSendOtp(
  identifier: string
): Promise<ForgotPasswordSendResponse> {
  const res = await request<{ success: boolean; data: ForgotPasswordSendResponse }>(
    "/auth/forgot-password/send-otp",
    { method: "POST", body: JSON.stringify({ identifier }) }
  );
  return res.data ?? (res as any);
}

/** POST /auth/forgot-password/verify-otp — returns resetToken */
export async function forgotPasswordVerifyOtp(
  identifier: string,
  otp: string
): Promise<ForgotPasswordVerifyResponse> {
  const res: ForgotPasswordVerifyResponse = await request<ForgotPasswordVerifyResponse>(
    "/auth/forgot-password/verify-otp",
    { method: "POST", body: JSON.stringify({ identifier, otp }) }
  );
  return res;
}

/** POST /auth/forgot-password/reset */
export async function resetPassword(
  resetToken: string,
  newPassword: string
): Promise<ResetPasswordResponse> {

  console.log(resetToken, "Hello ");
  return request<ResetPasswordResponse>("/auth/forgot-password/reset", {
    method: "POST",
    body: JSON.stringify({ resetToken, newPassword }),
  });
}
