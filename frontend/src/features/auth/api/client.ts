import { API_BASE_URL } from "@/lib/config";

// ── Token helpers ──────────────────────────────────────────────────────────

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("bms_access_token");
}

// ── Base request client ────────────────────────────────────────────────────

export async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAccessToken();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });

  const json = await res.json();

  if (!res.ok) {
    // Backend wraps errors as { success: false, error: { message } }
    const message =
      json?.error?.message ?? json?.message ?? "An unexpected error occurred";
    throw new Error(message);
  }

  return json as T;
}
