import { request } from "@/features/auth/api/client";
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

// ── Notifications ─────────────────────────────────────────────────────────

export const getMyNotifications = () =>
  request<ApiData<InAppNotification[]>>("/notifications").then(r => r.data);

export const markNotificationRead = (id: string) =>
  request<ApiData<InAppNotification>>(`/notifications/${id}/read`, {
    method: "PUT",
  }).then(r => r.data);
