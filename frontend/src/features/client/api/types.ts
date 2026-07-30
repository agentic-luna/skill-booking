// ── Client Request/Response Types ────────────────────────────────────────

export type EventMode = "ONLINE" | "OFFLINE";
export type EventStatus = "PENDING" | "APPROVED" | "CANCELED";
export type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "REFUNDED";

export interface HostUserDetail {
  firstName: string;
  lastName: string;
  phone: string;
}

export interface ClientHostProfile {
  id: string;
  userId: string;
  bio?: string;
  user?: HostUserDetail;
}

export interface ClientEvent {
  id: string;
  hostId: string;
  title: string;
  description?: string;
  images: string[];
  videoUrls?: string[];
  boostedEvent?: any;
  trainerName?: string;
  trainerInfo?: string;
  trainerBio?: string;
  posterUrl: string;
  mode: EventMode;
  venueDetails?: Record<string, any>;
  startTime: string; // ISO DateTime
  totalSeats: number;
  availableSeats: number;
  status: EventStatus;
  price?: number;
  duration?: string;
  durationHours?: number;
  category?: string;
  keywords?: string[];
  rating?: number;
  reviewsCount?: number;
  createdAt: string;
  updatedAt: string;
  host?: ClientHostProfile;
  _count?: {
    likes?: number;
    bookings?: number;
  };
}

export interface SearchEventsFilter {
  title?: string;
  mode?: EventMode;
  hostId?: string;
  startTimeFrom?: string;
  category?: string;
  district?: string;
  keywords?: string[];
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface WishlistItem {
  id: string;
  clientUserId: string;
  eventId: string;
  createdAt: string;
  event: ClientEvent;
}

export interface ClientBooking {
  id: string;
  bookingRef?: string;
  clientUserId?: string;
  clientId: string;
  eventId: string;
  seatCount: number;
  totalAmount: number;
  amountPaid?: number;
  status: BookingStatus;
  createdAt: string;
  event: ClientEvent;
}

export interface CheckoutPayload {
  eventId: string;
  seatCount: number;
  customAmount?: number;
}

export interface CheckoutResult {
  booking: {
    id: string;
    bookingRef: string;
    clientId: string;
    eventId: string;
    seatCount: number;
    totalAmount: number;
    status: string;
  };
  eventTitle: string;
  razorpayOrder?: any;
}

export interface ConfirmPaymentPayload {
  paymentMethod: string;
}

export interface ConfirmPaymentResult {
  success: boolean;
  bookingId: string;
  status: BookingStatus;
}

export interface CancelBookingResult {
  success: boolean;
  bookingId: string;
  refundAmount: number;
  status: BookingStatus;
}

export interface EventReview {
  id: string;
  clientUserId: string;
  eventId: string;
  bookingId: string;
  rating: number;
  comment?: string;
  createdAt: string;
  user?: {
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
  client?: {
    firstName: string;
    lastName: string;
  };
}

export interface SubmitReviewPayload {
  eventId: string;
  bookingId: string;
  rating: number;
  comment?: string;
}

export interface InAppNotification {
  id: string;
  recipientUserId: string;
  channel: "IN_APP" | "EMAIL" | "SMS" | "WHATSAPP";
  triggerEvent: string;
  subject?: string;
  bodyContent: string;
  status: "SENT" | "FAILED" | "PENDING" | "QUEUED" | "READ";
  createdAt: string;
}
