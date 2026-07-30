import { request } from "@/features/auth/api/client";
import { API_BASE_URL } from "@/lib/config";
import type {
  ClientEvent, SearchEventsFilter, WishlistItem, ClientBooking,
  CheckoutPayload, CheckoutResult, ConfirmPaymentPayload, ConfirmPaymentResult,
  CancelBookingResult, EventReview, SubmitReviewPayload, InAppNotification
} from "./types";

type ApiData<T> = { success: boolean; data: T };

// ── Events ────────────────────────────────────────────────────────────────

export const getEvents = (filters?: SearchEventsFilter) => {
  const params = new URLSearchParams();
  if (filters?.title) params.set("title", filters.title);
  if (filters?.mode) params.set("mode", filters.mode);
  if (filters?.hostId) params.set("hostId", filters.hostId);
  if (filters?.startTimeFrom) params.set("startTimeFrom", filters.startTimeFrom);
  if (filters?.category) params.set("category", filters.category);
  if (filters?.district) params.set("district", filters.district);
  if (filters?.keywords && filters.keywords.length > 0) {
    filters.keywords.forEach(k => params.append("keywords", k));
  }
  if (filters?.minPrice !== undefined) params.set("minPrice", String(filters.minPrice));
  if (filters?.maxPrice !== undefined) params.set("maxPrice", String(filters.maxPrice));
  if (filters?.sortBy) params.set("sortBy", filters.sortBy);
  if (filters?.sortOrder) params.set("sortOrder", filters.sortOrder);
  const query = params.toString() ? `?${params.toString()}` : "";
  return request<ApiData<ClientEvent[]>>(`/events${query}`).then(r => r.data);
};

export const getEventDetails = (id: string) =>
  request<ApiData<ClientEvent>>(`/events/${id}`).then(r => r.data);

export const getLikedEvents = () =>
  request<ApiData<{ count: number; likes: any[] }>>("/events/liked").then(r => r.data);

export const toggleLike = (id: string) =>
  request<ApiData<{ liked: boolean; totalLikes: number }>>(`/events/${id}/like`, { method: "POST" }).then(r => r.data);

// ── Wishlist ──────────────────────────────────────────────────────────────

export const getWishlist = () =>
  request<ApiData<{ items: WishlistItem[]; count: number }>>("/wishlist").then(r => r.data);

export const addToWishlist = (eventId: string) =>
  request<ApiData<WishlistItem>>("/wishlist", {
    method: "POST",
    body: JSON.stringify({ eventId }),
  }).then(r => r.data);

export const removeFromWishlist = (eventId: string) =>
  request<ApiData<{ success: boolean }>>(`/wishlist/${eventId}`, {
    method: "DELETE",
  }).then(r => r.data);

// ── Bookings ──────────────────────────────────────────────────────────────

export const getMyBookings = () =>
  request<ApiData<{ bookings: ClientBooking[]; count: number }>>("/bookings/my-bookings").then(r => r.data);

export const checkout = (payload: CheckoutPayload) =>
  request<ApiData<CheckoutResult>>("/bookings/checkout", {
    method: "POST",
    body: JSON.stringify(payload),
  }).then(r => r.data);

export const confirmPayment = (bookingId: string, payload: ConfirmPaymentPayload) =>
  request<ApiData<ConfirmPaymentResult>>(`/bookings/${bookingId}/confirm`, {
    method: "POST",
    body: JSON.stringify(payload),
  }).then(r => r.data);

export const cancelBooking = (bookingId: string) =>
  request<ApiData<CancelBookingResult>>(`/bookings/${bookingId}/cancel`, {
    method: "POST",
  }).then(r => r.data);

// ── Reviews ───────────────────────────────────────────────────────────────

export const submitReview = (payload: SubmitReviewPayload) =>
  request<ApiData<EventReview>>("/reviews", {
    method: "POST",
    body: JSON.stringify(payload),
  }).then(r => r.data);

export const getEventReviews = (eventId: string) =>
  request<ApiData<{ reviews: EventReview[]; stats: any }>>(`/reviews/event/${eventId}`).then(r => r.data);

export const getHostReviews = (hostId: string, page = 1, limit = 5) =>
  request<ApiData<{ reviews: EventReview[]; total: number; stats: any }>>(`/reviews/host/${hostId}?page=${page}&limit=${limit}`).then(r => r.data);

// ── Notifications ─────────────────────────────────────────────────────────

export const getMyNotifications = () =>
  request<ApiData<InAppNotification[]>>("/notifications").then(r => r.data);

export const markNotificationRead = (id: string) =>
  request<ApiData<InAppNotification>>(`/notifications/${id}/read`, {
    method: "PUT",
  }).then(r => r.data);

// ── Profile Settings & Host application (mounted under /hosts router) ──

export const updateProfile = (payload: { firstName: string; lastName: string; email: string }) =>
  request<ApiData<any>>("/hosts/profile", {
    method: "PUT",
    body: JSON.stringify(payload),
  }).then(r => r.data);

export const changePassword = (payload: { currentPassword: string; newPassword: string }) =>
  request<ApiData<any>>("/hosts/change-password", {
    method: "PUT",
    body: JSON.stringify(payload),
  }).then(r => r.data);

export const applyHost = (payload: { expertise: string; bio: string }) =>
  request<ApiData<any>>("/hosts/apply-host", {
    method: "POST",
    body: JSON.stringify(payload),
  }).then(r => r.data);

// ── Booking Invoice Download ──

export const getInvoiceUrl = (bookingId: string) => {
  return `${API_BASE_URL}/bookings/${bookingId}/invoice`;
};

export const getTicketUrl = (bookingId: string) => {
  return `${API_BASE_URL}/bookings/${bookingId}/ticket`;
};
