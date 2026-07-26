import { request } from "./client";
import type {
  OtpType,
  OtpSendResponse,
  OtpVerifyResponse,
} from "./types";

// ── OTP endpoints ─────────────────────────────────────────────────────────

/** POST /auth/otp/send — Send OTP for email or phone (registration) */
export async function sendOtp(
  target: string,
  type: OtpType
): Promise<OtpSendResponse> {
  const res = await request<{ success: boolean; data: OtpSendResponse }>(
    "/auth/otp/send",
    { method: "POST", body: JSON.stringify({ target, type }) }
  );
  return res.data ?? (res as any);
}

/** POST /auth/otp/verify — Verify OTP for email or phone (registration) */
export async function verifyOtp(
  target: string,
  type: OtpType,
  otp: string
): Promise<OtpVerifyResponse> {
  return request<OtpVerifyResponse>("/auth/otp/verify", {
    method: "POST",
    body: JSON.stringify({ target, type, otp }),
  });
}

/** POST /auth/client/otp/send — Send WhatsApp/SMS OTP for client registration */
export async function clientSendOtp(phone: string): Promise<OtpSendResponse> {
  const res = await request<{ success: boolean; data: OtpSendResponse }>(
    "/auth/client/otp/send",
    { method: "POST", body: JSON.stringify({ phone }) }
  );
  return res.data ?? (res as any);
}

/** POST /auth/client/otp/verify — Verify WhatsApp/SMS OTP for client registration */
export async function clientVerifyOtp(
  phone: string,
  otp: string
): Promise<OtpVerifyResponse> {
  return request<OtpVerifyResponse>("/auth/client/otp/verify", {
    method: "POST",
    body: JSON.stringify({ phone, otp }),
  });
}

