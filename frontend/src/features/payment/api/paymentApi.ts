import { request } from "@/features/auth/api/client";
import { API_BASE_URL } from "@/lib/config";

type ApiData<T> = { success: boolean; data: T };

// ── Public Key ──────────────────────────────────────────────────────────────

export async function getRazorpayPublicKey(): Promise<string | null> {
  const res = await fetch(`${API_BASE_URL}/payments/razorpay/public-key`);
  if (!res.ok) return null;
  const data = await res.json();
  return data?.data?.keyId ?? null;
}

// ── Create Order (POST /payments/order) ──────────────────────────────────────
// Initiates checkout: reserves seats + creates Razorpay order.

export interface CreateOrderPayload {
  eventId: string;
  seatCount: number;
  customAmount?: number;
  participants?: any[];
}

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
}

export interface CreateOrderResult {
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
  razorpayOrder?: RazorpayOrder;
}

export const createPaymentOrder = (payload: CreateOrderPayload) =>
  request<ApiData<CreateOrderResult>>("/payments/order", {
    method: "POST",
    body: JSON.stringify(payload),
  }).then((r) => r.data);

// ── Verify Payment (POST /payments/verify) ───────────────────────────────────
// Verifies Razorpay signature server-side and confirms the booking.

export interface VerifyPaymentPayload {
  bookingId: string;
  razorpayPaymentId: string;
  razorpayOrderId: string;
  razorpaySignature: string;
}

export interface VerifyPaymentResult {
  success: boolean;
  booking: {
    id: string;
    bookingRef: string;
    status: string;
    totalAmount: number;
  };
  gatewayTxnId: string;
  paymentMethod: string;
}

export const verifyPayment = (payload: VerifyPaymentPayload) =>
  request<ApiData<VerifyPaymentResult>>("/payments/verify", {
    method: "POST",
    body: JSON.stringify(payload),
  }).then((r) => r.data);

// ── Refund Status (GET /payments/refund/:bookingId) ──────────────────────────

export interface RefundStatus {
  bookingId: string;
  bookingRef: string;
  bookingStatus: string;
  refundRequest: {
    id: string;
    status: "PENDING" | "APPROVED" | "DECLINED";
    refundAmount: number;
    refundPercentage: number;
    reason: string | null;
    createdAt: string;
  } | null;
  message?: string;
}

export const getRefundStatus = (bookingId: string) =>
  request<ApiData<RefundStatus>>(`/payments/refund/${bookingId}`).then(
    (r) => r.data
  );