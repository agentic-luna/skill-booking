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
  return request<OtpSendResponse>("/auth/otp/send", {
    method: "POST",
    body: JSON.stringify({ target, type }),
  });
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
