"use client";

import { useState, useEffect, useCallback } from "react";
import { getRefundStatus, RefundStatus } from "../api/paymentApi";

/**
 * Fetches and auto-refreshes the refund status for a booking.
 * Polls every 30s while status is PENDING.
 */
export function useRefundStatus(bookingId: string | null) {
  const [data, setData] = useState<RefundStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!bookingId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await getRefundStatus(bookingId);
      setData(result);
    } catch (err: any) {
      setError(err.message || "Failed to load refund status");
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  // Poll while refund is PENDING
  useEffect(() => {
    if (!bookingId || data?.refundRequest?.status !== "PENDING") return;
    const interval = setInterval(fetch, 30_000);
    return () => clearInterval(interval);
  }, [bookingId, data?.refundRequest?.status, fetch]);

  return { data, loading, error, refetch: fetch };
}
