import type { User } from "./auth.types";

// ── localStorage key constants ─────────────────────────────────────────────

export const TOKEN_KEY = "bms_access_token";
export const REFRESH_KEY = "bms_refresh_token";
export const SESSION_KEY = "bookmyskill_session";

// ── Token helpers ──────────────────────────────────────────────────────────

export function saveTokens(accessToken: string, refreshToken: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_KEY, refreshToken);
}

export function clearTokens(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(SESSION_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_KEY);
}

// ── Session helpers ────────────────────────────────────────────────────────

export function saveSession(user: User): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}
