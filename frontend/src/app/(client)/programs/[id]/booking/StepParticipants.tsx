"use client";

import React from "react";
import { Users, Plus, Minus } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { SummaryRow } from "./BookingAtoms";
import { BookingSummary } from "./types";

interface StepParticipantsProps {
  qty: number;
  maxQty: number;
  pricePerSeat: number;
  summary: BookingSummary;
  platformRate: number;
  onQtyChange: (qty: number) => void;
}

export default function StepParticipants({
  qty,
  maxQty,
  pricePerSeat,
  summary,
  platformRate,
  onQtyChange,
}: StepParticipantsProps) {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-bold text-sm text-foreground mb-1">Number of Participants</h3>
        <p className="text-[11px] text-muted-foreground">Select how many seats you want to reserve.</p>
      </div>

      {/* Quantity Selector */}
      <div className="flex items-center justify-between bg-muted/30 p-4 rounded-xl border">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 text-primary p-2.5 rounded-lg">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <div className="font-bold text-sm text-foreground">Participants</div>
            <div className="text-[11px] text-muted-foreground">₹{pricePerSeat} per seat</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onQtyChange(Math.max(1, qty - 1))}
            disabled={qty === 1}
            className="h-8 w-8 rounded-lg border bg-card flex items-center justify-center disabled:opacity-40 hover:bg-muted transition-colors active:scale-95"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="w-8 text-center font-extrabold text-lg text-foreground">{qty}</span>
          <button
            type="button"
            onClick={() => onQtyChange(Math.min(maxQty, qty + 1))}
            disabled={qty >= maxQty}
            className="h-8 w-8 rounded-lg border bg-card flex items-center justify-center disabled:opacity-40 hover:bg-muted transition-colors active:scale-95"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Quick Summary */}
      <div className="bg-muted/20 rounded-xl border p-4 space-y-2.5">
        <SummaryRow label="Program Fee" value={`₹${summary.programFee.toFixed(2)}`} />
        <SummaryRow label={`Platform Fee (${(platformRate * 100).toFixed(1)}%)`} value={`₹${summary.platformFee.toFixed(2)}`} />
        {summary.discount > 0 && (
          <SummaryRow label="Discount" value={`-₹${summary.discount.toFixed(2)}`} accent />
        )}
        <Separator />
        <SummaryRow label="Total Payable" value={`₹${summary.total.toFixed(2)}`} bold accent />
      </div>
    </div>
  );
}
