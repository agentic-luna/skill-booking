import { API_BASE_URL } from "@/lib/config";

// ── Token helper (re-uses same localStorage key as auth feature) ───────────

function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("bms_access_token");
}

// ── Typed request helper ──────────────────────────────────────────────────

export async function hostRequest<T>(
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
    const message =
      json?.error?.message ?? json?.message ?? "An unexpected error occurred";
    throw new Error(message);
  }

  return json as T;
}
