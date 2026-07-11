import type { User } from "./auth.types";

// ── localStorage key constants ─────────────────────────────────────────────

export const TOKEN_KEY   = "bms_access_token";
export const REFRESH_KEY = "bms_refresh_token";
export const SESSION_KEY = "bookmyskill_session";

/** Cookie max-age: 7 days (matches typical refresh-token lifetime) */
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

// ── Cookie helpers (keep middleware in sync) ───────────────────────────────
// Next.js middleware runs in the Edge runtime and cannot access localStorage.
// We mirror the access-token and user-role into short-lived SameSite cookies
// so the middleware can perform auth checks server-side without an extra API call.

function setCookie(name: string, value: string, maxAge = COOKIE_MAX_AGE): void {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function deleteCookie(name: string): void {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
}

// ── Token helpers ──────────────────────────────────────────────────────────

export function saveTokens(accessToken: string, refreshToken: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_KEY, refreshToken);
  // Mirror to cookie so middleware can check auth without calling the API
  setCookie("bms_access_token", accessToken);
}

export function clearTokens(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(SESSION_KEY);
  deleteCookie("bms_access_token");
  deleteCookie("bms_session");
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_KEY);
}

// ── Session helpers ────────────────────────────────────────────────────────

export function saveSession(user: User): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  // Mirror role into cookie so middleware can do RBAC without parsing the JWT
  setCookie("bms_session", JSON.stringify({ role: user.role }));
}
