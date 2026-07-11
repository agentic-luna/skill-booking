// ── Host API request/response types ──────────────────────────────────────

// ── KYC ──────────────────────────────────────────────────────────────────

export type KycAccountType = "INDIVIDUAL" | "COMPANY";

export interface SubmitKycPayload {
  accountType: KycAccountType;
  govIdUrl: string;
  gstNumber?: string;
  bio?: string;
}

export interface KycResponse {
  id: string;
  userId: string;
  accountType: KycAccountType;
  govIdUrl: string;
  gstNumber?: string;
  bio?: string;
  kycStatus: "PENDING" | "APPROVED" | "REJECTED";
}

// ── Bank Details ──────────────────────────────────────────────────────────

export interface BankDetailsPayload {
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  upiId?: string;
}

export interface BankDetailsResponse {
  id: string;
  hostProfileId: string;
  bankName: string;
  updatedAt: string;
}

// ── Events (Create) ───────────────────────────────────────────────────────

export type EventMode = "ONLINE" | "OFFLINE" | "HYBRID";

export interface CreateEventPayload {
  title: string;
  posterUrl?: string;
  mode: EventMode;
  venueDetails?: string;
  startTime: string; // ISO 8601
  totalSeats: number;
}

export interface CreatedEvent {
  id: string;
  title: string;
  mode: EventMode;
  venueDetails?: string;
  startTime: string;
  totalSeats: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
}

// ── Dashboard ─────────────────────────────────────────────────────────────

export interface DashboardStats {
  grossRevenue: number;
  netRevenue: number;
  totalBookings: number;
  totalEvents: number;
  pendingEvents: number;
  approvedEvents: number;
  averageRating?: number;
  /** Monthly breakdown for charts */
  monthlyRevenue?: Array<{ month: string; earnings: number }>;
  /** Weekly booking trend */
  weeklyBookings?: Array<{ day: string; bookings: number }>;
  recentBookings?: Array<{
    id: string;
    clientName: string;
    eventTitle: string;
    amountPaid: number;
    bookingDate: string;
  }>;
}
