// ── Public barrel — re-exports everything from the split modules ──────────
// Keeps existing imports like `import * as authApi from "@/features/auth/api/authApi"` working.

export * from "./types";
export * from "./client";
export * from "./otp.api";
export * from "./auth.api";
