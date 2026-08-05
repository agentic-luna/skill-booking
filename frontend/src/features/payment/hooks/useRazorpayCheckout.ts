"use client";

import { useState, useCallback } from "react";
import {
  getRazorpayPublicKey,
  createPaymentOrder,
  verifyPayment,
  CreateOrderPayload,
  CreateOrderResult,
  VerifyPaymentResult,
  RazorpayOrder,
} from "../api/paymentApi";

/** Lazily loads the Razorpay checkout script once per page session. */
export function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return resolve();
    if ((window as any).Razorpay) return resolve();
    const existing = document.getElementById("razorpay-sdk");
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Failed to load Razorpay SDK script")));
      return;
    }
    const script = document.createElement("script");
    script.id = "razorpay-sdk";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay SDK script"));
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

export interface RazorpayCheckoutResult<T = VerifyPaymentResult> {
  booking?: CreateOrderResult["booking"];
  verification: T;
  data?: any;
}

export interface UserInfo {
  name?: string;
  email?: string;
  phone?: string;
}

export interface CustomCheckoutParams<TVerifyResult = any> {
  /** Function that creates the backend order and returns razorpay order details */
  createOrder: () => Promise<{ razorpayOrder: RazorpayOrder; description?: string; extraData?: any }>;
  /** User information for prefilling Razorpay modal */
  userInfo?: UserInfo;
  /** Custom title for Razorpay modal. Defaults to "BookMyTraining" */
  modalTitle?: string;
  /** Custom description for Razorpay modal */
  description?: string;
  /** Custom theme color (hex string). Defaults to "#6366f1" */
  themeColor?: string;
  /** Function that verifies the payment signature on backend */
  verifyPayment: (response: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => Promise<TVerifyResult>;
}

interface UseRazorpayCheckoutOptions<T = any> {
  /** Called when the full checkout+verify cycle succeeds. */
  onSuccess?: (result: RazorpayCheckoutResult<T>) => void;
  /** Called when any step fails. */
  onError?: (message: string) => void;
}

/**
 * Encapsulates the full Razorpay checkout flow:
 *  1. Order creation (standard booking or custom order creation)
 *  2. Fetch Razorpay public key & load SDK script
 *  3. Opens Razorpay SDK modal
 *  4. Server-side HMAC verification + confirmation
 */
export function useRazorpayCheckout<T = any>(opts: UseRazorpayCheckoutOptions<T> = {}) {
  const [state, setState] = useState<CheckoutState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RazorpayCheckoutResult<T> | null>(null);

  const processRazorpayModal = useCallback(
    async <V>(params: {
      razorpayOrder: RazorpayOrder;
      description?: string;
      userInfo?: UserInfo;
      modalTitle?: string;
      themeColor?: string;
      verifyPayment: (res: {
        razorpay_payment_id: string;
        razorpay_order_id: string;
        razorpay_signature: string;
      }) => Promise<V>;
    }): Promise<V> => {
      setState("awaiting_payment");
      const keyId = await getRazorpayPublicKey();

      if (!keyId) {
        throw new Error("Payment gateway is not configured. Admin has to configure Razorpay credentials.");
      }
      if (!params.razorpayOrder?.id) {
        throw new Error("Failed to initialize payment gateway order.");
      }

      await loadRazorpayScript();

      // Convert amount in rupees to paise if needed
      const rawAmount = params.razorpayOrder.amount;
      const amountInPaise = rawAmount < 100000 ? Math.round(rawAmount * 100) : rawAmount;

      return new Promise<V>((resolve, reject) => {
        const rzp = new (window as any).Razorpay({
          key: keyId,
          amount: amountInPaise,
          currency: params.razorpayOrder.currency || "INR",
          name: params.modalTitle || "BookMyTraining",
          description: params.description || "Payment Transaction",
          order_id: params.razorpayOrder.id,
          prefill: {
            name: params.userInfo?.name || "",
            email: params.userInfo?.email || "",
            contact: params.userInfo?.phone || "",
          },
          theme: { color: params.themeColor || "#6366f1" },
          handler: async (response: {
            razorpay_payment_id: string;
            razorpay_order_id: string;
            razorpay_signature: string;
          }) => {
            try {
              setState("verifying");
              const verif = await params.verifyPayment(response);
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
    },
    []
  );

  const startCheckout = useCallback(
    async (payload: CreateOrderPayload, userInfo: UserInfo) => {
      setError(null);
      setResult(null);

      try {
        setState("creating_order");
        const orderData = await createPaymentOrder(payload);
        const { booking, razorpayOrder } = orderData;

        if (!razorpayOrder) {
          throw new Error("Failed to initialize payment gateway order.");
        }

        const verificationResult = await processRazorpayModal({
          razorpayOrder,
          description: orderData.eventTitle,
          userInfo,
          verifyPayment: (res) =>
            verifyPayment({
              bookingId: booking.id,
              razorpayPaymentId: res.razorpay_payment_id,
              razorpayOrderId: res.razorpay_order_id,
              razorpaySignature: res.razorpay_signature,
            }),
        });

        const checkoutResult: RazorpayCheckoutResult<any> = {
          booking,
          verification: verificationResult,
        };
        setResult(checkoutResult as RazorpayCheckoutResult<T>);
        setState("success");
        opts.onSuccess?.(checkoutResult as RazorpayCheckoutResult<T>);
        return checkoutResult;
      } catch (err: any) {
        const msg = err.message || "Checkout failed. Please try again.";
        setError(msg);
        setState("error");
        opts.onError?.(msg);
        throw err;
      }
    },
    [opts, processRazorpayModal]
  );

  const startCustomCheckout = useCallback(
    async <V = any>(params: CustomCheckoutParams<V>) => {
      setError(null);
      setResult(null);

      try {
        setState("creating_order");
        const { razorpayOrder, description, extraData } = await params.createOrder();

        const verificationResult = await processRazorpayModal<V>({
          razorpayOrder,
          description: description || params.description,
          userInfo: params.userInfo,
          modalTitle: params.modalTitle,
          themeColor: params.themeColor,
          verifyPayment: params.verifyPayment,
        });

        const checkoutResult: RazorpayCheckoutResult<V> = {
          verification: verificationResult,
          data: extraData,
        };
        setResult(checkoutResult as any);
        setState("success");
        opts.onSuccess?.(checkoutResult as any);
        return checkoutResult;
      } catch (err: any) {
        const msg = err.message || "Checkout failed. Please try again.";
        setError(msg);
        setState("error");
        opts.onError?.(msg);
        throw err;
      }
    },
    [opts, processRazorpayModal]
  );

  const reset = useCallback(() => {
    setState("idle");
    setError(null);
    setResult(null);
  }, []);

  return {
    startCheckout,
    startCustomCheckout,
    reset,
    state,
    error,
    result,
    isLoading: state === "creating_order" || state === "awaiting_payment" || state === "verifying",
    isSuccess: state === "success",
  };
}

