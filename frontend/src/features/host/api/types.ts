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
  images?: string[];
  videoUrls?: string[];
  mode: EventMode;
  venue?: {
    address: string;
    meetingLink?: string | null;
    district?: string;
    endDate?: string;
  };
  instructor?: {
    name: string;
    bio?: string;
    photoUrl?: string;
    companyName?: string;
    facebook?: string | null;
    instagram?: string | null;
    linkedin?: string | null;
  };
  startTime: string; // ISO 8601
  totalSeats: number;
  price?: number;
  duration?: string;
  description?: string;
  category?: string;
}

export interface CreatedEvent {
  id: string;
  title: string;
  mode: EventMode;
  venueDetails?: any;
  startTime: string;
  totalSeats: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
}

// ── Dashboard ─────────────────────────────────────────────────────────────

/**
 * Matches the actual backend response from GET /hosts/dashboard.
 * Additional richer fields (charts, bookings) are optional — the UI
 * falls back to zeros/empty arrays when they are absent.
 */
export interface DashboardStats {
  /** Net earnings released to the host */
  totalEarnings: number;
  /** Revenue still held in escrow (pending release) */
  heldEscrow: number;
  /** Number of active ticket sales (non-refunded captures) */
  activeTicketSales: number;
  /** Gross ticket revenue (captured amount) */
  totalRevenue: number;
  /** Total number of events created by the host */
  eventsCount: number;

  // ── Optional enriched fields (returned only when the backend is extended) ──
  averageRating?: number;
  monthlyRevenue?: Array<{ month: string; earnings: number }>;
  weeklyBookings?: Array<{ day: string; bookings: number }>;
  /** Full booking objects as returned by the enriched endpoint */
  recentBookings?: Array<any>;
}
