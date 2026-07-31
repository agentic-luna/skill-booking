"use client";

import { useState, useCallback } from "react";
import {
  getRazorpayPublicKey,
  createPaymentOrder,
  verifyPayment,
  CreateOrderPayload,
  CreateOrderResult,
  VerifyPaymentResult,
} from "../api/paymentApi";

/** Lazily loads the Razorpay checkout script once per page session. */
function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) return resolve();
    const existing = document.getElementById("razorpay-sdk");
    if (existing) {
      existing.addEventListener("load", () => resolve());
      return;
    }
    const script = document.createElement("script");
    script.id = "razorpay-sdk";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    document.body.appendChild(script);
  });
}

export type CheckoutState =
  | "idle"
  | "creating_order"
  | "awaiting_payment"
  | "verifying"
  | "success"
  | "error";

export interface RazorpayCheckoutResult {
  booking: CreateOrderResult["booking"];
  verification: VerifyPaymentResult;
}

interface UseRazorpayCheckoutOptions {
  /** Called when the full checkout+verify cycle succeeds. */
  onSuccess?: (result: RazorpayCheckoutResult) => void;
  /** Called when any step fails. */
  onError?: (message: string) => void;
}

/**
 * Encapsulates the full Razorpay checkout flow:
 *  1. POST /payments/order   → creates order + reserves seats
 *  2. Opens Razorpay SDK modal
 *  3. POST /payments/verify  → server-side HMAC verification + booking confirmation
 *
 * Falls back to MOCK_SUCCESS when Razorpay is not configured (keyId null).
 */
export function useRazorpayCheckout(opts: UseRazorpayCheckoutOptions = {}) {
  const [state, setState] = useState<CheckoutState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RazorpayCheckoutResult | null>(null);

  const startCheckout = useCallback(
    async (payload: CreateOrderPayload, userInfo: { name: string; email: string; phone: string }) => {
      setError(null);
      setResult(null);

      try {
        // ─── Step 1: Create Razorpay order & reserve seats ───────────────
        setState("creating_order");
        const orderData = await createPaymentOrder(payload);
        const { booking, razorpayOrder } = orderData;

        // ─── Step 2: Fetch public key & decide flow ───────────────────────
        setState("awaiting_payment");
        const keyId = await getRazorpayPublicKey();

        if (!keyId || !razorpayOrder?.id) {
          // No live Razorpay config — use MOCK_SUCCESS sentinel
          setState("verifying");
          const verif = await verifyPayment({
            bookingId: booking.id,
            razorpayPaymentId: "mock_pay_" + Date.now(),
            razorpayOrderId: razorpayOrder?.id || "mock_order_" + Date.now(),
            razorpaySignature: "MOCK_SUCCESS",
          });
          const checkoutResult: RazorpayCheckoutResult = { booking, verification: verif };
          setResult(checkoutResult);
          setState("success");
          opts.onSuccess?.(checkoutResult);
          return checkoutResult;
        }

        // ─── Step 3: Load SDK + Open real Razorpay modal ─────────────────
        await loadRazorpayScript();
        const verificationResult = await new Promise<VerifyPaymentResult>((resolve, reject) => {
          const rzp = new (window as any).Razorpay({
            key: keyId,
            amount: razorpayOrder.amount * 100, // already in paise from backend
            currency: razorpayOrder.currency || "INR",
            name: "BookMySkill",
            description: orderData.eventTitle,
            order_id: razorpayOrder.id,
            prefill: {
              name: userInfo.name,
              email: userInfo.email,
              contact: userInfo.phone,
            },
            theme: { color: "#6366f1" },
            handler: async (response: {
              razorpay_payment_id: string;
              razorpay_order_id: string;
              razorpay_signature: string;
            }) => {
              try {
                setState("verifying");
                // ─── Step 4: Server-side signature verification ───────────
                const verif = await verifyPayment({
                  bookingId: booking.id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpayOrderId: response.razorpay_order_id,
                  razorpaySignature: response.razorpay_signature,
                });
                resolve(verif);
              } catch (err: any) {
                reject(new Error(err.message || "Payment verification failed"));
              }
            },
            modal: {
              ondismiss: () => {
                reject(new Error("Payment was cancelled by the user."));
              },
            },
          });
          rzp.open();
        });

        const checkoutResult: RazorpayCheckoutResult = {
          booking,
          verification: verificationResult,
        };
        setResult(checkoutResult);
        setState("success");
        opts.onSuccess?.(checkoutResult);
        return checkoutResult;
      } catch (err: any) {
        const msg = err.message || "Checkout failed. Please try again.";
        setError(msg);
        setState("error");
        opts.onError?.(msg);
        throw err;
      }
    },
    [opts]
  );

  const reset = useCallback(() => {
    setState("idle");
    setError(null);
    setResult(null);
  }, []);

  return {
    startCheckout,
    reset,
    state,
    error,
    result,
    isLoading: state === "creating_order" || state === "verifying",
    isSuccess: state === "success",
  };
}
