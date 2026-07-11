import { hostRequest } from "./client";
import type {
  SubmitKycPayload,
  KycResponse,
  BankDetailsPayload,
  BankDetailsResponse,
  CreateEventPayload,
  CreatedEvent,
  DashboardStats,
} from "./types";

// ── KYC ──────────────────────────────────────────────────────────────────

/** POST /hosts/kyc — Submit KYC document profile verification details */
export async function submitKyc(payload: SubmitKycPayload): Promise<KycResponse> {
  const res = await hostRequest<{ success: boolean; data: KycResponse }>(
    "/hosts/kyc",
    { method: "POST", body: JSON.stringify(payload) }
  );
  return res.data;
}

// ── Bank Details ──────────────────────────────────────────────────────────

/** POST /hosts/bank-details — Submit host bank account details (encrypted at rest) */
export async function submitBankDetails(
  payload: BankDetailsPayload
): Promise<BankDetailsResponse> {
  const res = await hostRequest<{ success: boolean; data: BankDetailsResponse }>(
    "/hosts/bank-details",
    { method: "POST", body: JSON.stringify(payload) }
  );
  return res.data;
}

/** PUT /hosts/bank-details — Update host bank account details (encrypted at rest) */
export async function updateBankDetails(
  payload: BankDetailsPayload
): Promise<BankDetailsResponse> {
  const res = await hostRequest<{ success: boolean; data: BankDetailsResponse }>(
    "/hosts/bank-details",
    { method: "PUT", body: JSON.stringify(payload) }
  );
  return res.data;
}

// ── Events ────────────────────────────────────────────────────────────────

/** POST /hosts/events — Create a new skill booking event (enters PENDING status) */
export async function createEvent(payload: CreateEventPayload): Promise<CreatedEvent> {
  const res = await hostRequest<{ success: boolean; data: CreatedEvent }>(
    "/hosts/events",
    { method: "POST", body: JSON.stringify(payload) }
  );
  return res.data;
}

// ── Dashboard ─────────────────────────────────────────────────────────────

/** GET /hosts/dashboard — Retrieve host dashboard financial aggregations */
export async function getHostDashboard(): Promise<DashboardStats> {
  const res = await hostRequest<{ success: boolean; data: DashboardStats }>(
    "/hosts/dashboard"
  );
  return res.data;
}
