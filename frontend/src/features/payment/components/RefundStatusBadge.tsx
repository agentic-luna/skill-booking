"use client";

import React from "react";
import { Clock, CheckCircle2, XCircle, RefreshCw, Loader2 } from "lucide-react";
import { useRefundStatus } from "@/features/payment/hooks/useRefundStatus";

interface RefundStatusBadgeProps {
  bookingId: string;
  /** Show inline as a compact badge (default) or expanded card */
  variant?: "badge" | "card";
}

const STATUS_CONFIG = {
  PENDING: {
    label: "Refund Pending",
    icon: Clock,
    className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
    dot: "bg-amber-500",
  },
  APPROVED: {
    label: "Refund Approved",
    icon: CheckCircle2,
    className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    dot: "bg-emerald-500",
  },
  DECLINED: {
    label: "Refund Declined",
    icon: XCircle,
    className: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30",
    dot: "bg-red-500",
  },
} as const;

export default function RefundStatusBadge({
  bookingId,
  variant = "badge",
}: RefundStatusBadgeProps) {
  const { data, loading, error, refetch } = useRefundStatus(bookingId);

  if (loading && !data) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" />
        Loading refund status…
      </span>
    );
  }

  if (error || !data) return null;

  if (!data.refundRequest) {
    if (data.bookingStatus === "REFUNDED") {
      const cfg = STATUS_CONFIG.APPROVED;
      if (variant === "badge") {
        return (
          <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${cfg.className}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
            Refunded
          </span>
        );
      }
      return (
        <div className={`rounded-xl border p-3 space-y-2 ${cfg.className}`}>
           <div className="flex items-center justify-between">
             <div className="flex items-center gap-2 font-bold text-xs">
               <CheckCircle2 className="h-4 w-4" /> Refunded
             </div>
             <button onClick={refetch} className="opacity-60 hover:opacity-100 transition-opacity">
               <RefreshCw className="h-3.5 w-3.5" />
             </button>
           </div>
           <p className="text-[10px] opacity-70 leading-snug">Your payment has been successfully refunded.</p>
        </div>
      );
    }

    // Default to processing if no explicit refund request exists but badge is rendered
    const cfg = STATUS_CONFIG.PENDING;
    if (variant === "badge") {
      return (
        <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${cfg.className}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
          Processing Refund
        </span>
      );
    }
    return (
      <div className={`rounded-xl border p-3 space-y-2 ${cfg.className}`}>
         <div className="flex items-center justify-between">
           <div className="flex items-center gap-2 font-bold text-xs">
             <Clock className="h-4 w-4" /> Processing Refund
           </div>
           <button onClick={refetch} className="opacity-60 hover:opacity-100 transition-opacity">
             <RefreshCw className="h-3.5 w-3.5" />
           </button>
         </div>
         <p className="text-[10px] opacity-70 leading-snug">Your refund is being processed automatically.</p>
      </div>
    );
  }

  const { refundRequest } = data;
  const cfg = STATUS_CONFIG[refundRequest.status];
  const Icon = cfg.icon;

  if (variant === "badge") {
    return (
      <span
        className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${cfg.className}`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
        {cfg.label}
      </span>
    );
  }

  // Card variant — richer display
  return (
    <div className={`rounded-xl border p-3 space-y-2 ${cfg.className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-xs">
          <Icon className="h-4 w-4" />
          {cfg.label}
        </div>
        <button
          onClick={refetch}
          title="Refresh refund status"
          className="opacity-60 hover:opacity-100 transition-opacity"
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-1.5 text-[11px]">
        <div>
          <span className="opacity-70">Refund Amount</span>
          <div className="font-bold">₹{Number(refundRequest.refundAmount).toFixed(2)}</div>
        </div>
        <div>
          <span className="opacity-70">Percentage</span>
          <div className="font-bold">{refundRequest.refundPercentage}%</div>
        </div>
      </div>

      {refundRequest.reason && (
        <p className="text-[10px] opacity-70 leading-snug">{refundRequest.reason}</p>
      )}

      {refundRequest.status === "PENDING" && (
        <p className="text-[10px] opacity-60">
          Pending admin review · auto-refreshes every 30s
        </p>
      )}
    </div>
  );
}
