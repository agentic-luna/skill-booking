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

/** GET /hosts/bank-details — Retrieve host bank account details (decrypted) */
export async function getBankDetails(): Promise<any> {
  const res = await hostRequest<{ success: boolean; data: any }>(
    "/hosts/bank-details",
    { method: "GET" }
  );
  return res.data;
}

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

/** PUT /hosts/events/:id — Update a host event (before approval) */
export async function updateEvent(id: string, payload: any): Promise<any> {
  const res = await hostRequest<{ success: boolean; data: any }>(
    `/hosts/events/${id}`,
    { method: "PUT", body: JSON.stringify(payload) }
  );
  return res.data;
}

/** DELETE /hosts/events/:id — Delete a host event (before approval) */
export async function deleteEvent(id: string): Promise<any> {
  const res = await hostRequest<{ success: boolean; data: any }>(
    `/hosts/events/${id}`,
    { method: "DELETE" }
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

export async function getMyEvents(): Promise<any[]> {
  const res = await hostRequest<{ success: boolean; data: any[] }>(
    "/hosts/my-events"
  );
  return res.data;
}

export async function getHostParticipants(): Promise<any[]> {
  const res = await hostRequest<{ success: boolean; data: any[] }>(
    "/hosts/participants"
  );
  return res.data;
}

export async function getEventBookings(eventId: string): Promise<any[]> {
  const res = await hostRequest<{ success: boolean; data: any[] }>(
    `/hosts/events/${eventId}/bookings`
  );
  return res.data;
}
