import { create } from "zustand";
import * as api from "../api/client.api";
import type {
  ClientEvent, SearchEventsFilter, WishlistItem, ClientBooking,
  CheckoutPayload, CheckoutResult, ConfirmPaymentPayload, ConfirmPaymentResult,
  CancelBookingResult, EventReview, SubmitReviewPayload, InAppNotification
} from "../api/types";

interface ClientState {
  loading: boolean;
  error: string | null;

  events: ClientEvent[];
  likedEvents: ClientEvent[];
  wishlist: WishlistItem[];
  bookings: ClientBooking[];
  notifications: InAppNotification[];
  reviews: EventReview[];
  reviewsTotalCount: number;

  fetchEvents: (filters?: SearchEventsFilter) => Promise<void>;
  fetchEventDetails: (id: string) => Promise<ClientEvent>;
  fetchLikedEvents: () => Promise<void>;
  toggleLike: (id: string) => Promise<boolean>; // returns if now liked
  fetchWishlist: () => Promise<void>;
  addToWishlist: (eventId: string) => Promise<void>;
  removeFromWishlist: (eventId: string) => Promise<void>;
  fetchBookings: () => Promise<void>;
  checkoutBooking: (payload: CheckoutPayload) => Promise<CheckoutResult>;
  confirmPayment: (bookingId: string, payload: ConfirmPaymentPayload) => Promise<ConfirmPaymentResult>;
  cancelBooking: (bookingId: string) => Promise<CancelBookingResult>;
  fetchReviews: (eventId: string) => Promise<void>;
  fetchHostReviews: (hostId: string, page?: number, limit?: number) => Promise<void>;
  submitReview: (payload: SubmitReviewPayload) => Promise<EventReview>;
  fetchNotifications: () => Promise<void>;
  readNotification: (id: string) => Promise<void>;

  clearError: () => void;
}

function withLoading<T>(
  set: (partial: Partial<ClientState>) => void,
  fn: () => Promise<T>
): Promise<T> {
  set({ loading: true, error: null });
  return fn()
    .then((result) => { set({ loading: false }); return result; })
    .catch((e: any) => { 
       set({ error: e.message, loading: false }); 
       console.warn("Store error caught:", e.message);
       throw e;
    });
}

export const useClientStore = create<ClientState>((set, get) => ({
  loading: false,
  error: null,

  events: [],
  likedEvents: [],
  wishlist: [],
  bookings: [],
  notifications: [],
  reviews: [],
  reviewsTotalCount: 0,

  fetchEvents: (filters) => withLoading(set, async () => {
    const events = await api.getEvents(filters);
    set({ events });
  }),

  fetchEventDetails: (id) => withLoading(set, () => api.getEventDetails(id)),

  fetchLikedEvents: () => withLoading(set, async () => {
    const result = await api.getLikedEvents();
    set({ likedEvents: (result.likes || []).map((l: any) => l.event).filter(Boolean) });
  }),

  toggleLike: (id) => withLoading(set, async () => {
    const result = await api.toggleLike(id);
    // Refresh liked list
    await get().fetchLikedEvents();
    return result.liked;
  }),

  fetchWishlist: () => withLoading(set, async () => {
    const result = await api.getWishlist();
    set({ wishlist: result.items || [] });
  }),

  addToWishlist: (eventId) => withLoading(set, async () => {
    await api.addToWishlist(eventId);
    await get().fetchWishlist();
  }),

  removeFromWishlist: (eventId) => withLoading(set, async () => {
    await api.removeFromWishlist(eventId);
    await get().fetchWishlist();
  }),

  fetchBookings: () => withLoading(set, async () => {
    const result = await api.getMyBookings();
    set({ bookings: result.bookings || [] });
  }),

  checkoutBooking: (payload) => withLoading(set, () => api.checkout(payload)),

  confirmPayment: (bookingId, payload) => withLoading(set, async () => {
    const result = await api.confirmPayment(bookingId, payload);
    await get().fetchBookings();
    return result;
  }),

  cancelBooking: (bookingId) => withLoading(set, async () => {
    const result = await api.cancelBooking(bookingId);
    await get().fetchBookings();
    return result;
  }),

  fetchReviews: (eventId) => withLoading(set, async () => {
    const result = await api.getEventReviews(eventId);
    set({ reviews: result.reviews || [] });
  }),

  fetchHostReviews: (hostId, page = 1, limit = 5) => withLoading(set, async () => {
    const result = await api.getHostReviews(hostId, page, limit);
    set({ 
      reviews: result.reviews || [],
      reviewsTotalCount: result.total || 0
    });
  }),

  submitReview: (payload) => withLoading(set, async () => {
    const review = await api.submitReview(payload);
    return review;
  }),

  fetchNotifications: () => withLoading(set, async () => {
    const notifications = await api.getMyNotifications();
    set({ notifications });
  }),

  readNotification: (id) => withLoading(set, async () => {
    await api.markNotificationRead(id);
    set({ notifications: get().notifications.map((n) => n.id === id ? { ...n, status: "READ" } : n) });
  }),

  clearError: () => set({ error: null }),
}));
