"use client";

import React from "react";
import { CreditCard, ChevronRight, AlertCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { SummaryRow } from "./BookingAtoms";
import { BookingSummary } from "./types";

interface StepPaymentProps {
  qty: number;
  summary: BookingSummary;
  platformRate: number;
  termsAgreed: boolean;
  cancellationAgreed: boolean;
  notificationsAgreed: boolean;
  onTermsChange: (val: boolean) => void;
  onCancellationChange: (val: boolean) => void;
  onNotificationsChange: (val: boolean) => void;
  onPayClick: () => void;
  canProceed: boolean;
}

export default function StepPayment({
  qty,
  summary,
  platformRate,
  termsAgreed,
  cancellationAgreed,
  notificationsAgreed,
  onTermsChange,
  onCancellationChange,
  onNotificationsChange,
  onPayClick,
  canProceed,
}: StepPaymentProps) {
  const checkboxes = [
    { id: "terms", checked: termsAgreed, onChange: onTermsChange, label: "I agree to the Terms and Conditions." },
    { id: "cancellation", checked: cancellationAgreed, onChange: onCancellationChange, label: "I agree to the Cancellation and Refund Policy." },
    { id: "notifications", checked: notificationsAgreed, onChange: onNotificationsChange, label: "I agree to receive booking-related notifications." },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-bold text-sm text-foreground mb-1">Payment Summary</h3>
        <p className="text-[11px] text-muted-foreground">Review the final charges before payment.</p>
      </div>

      {/* Breakdown */}
      <div className="bg-muted/20 rounded-xl border p-4 space-y-2.5">
        <SummaryRow label="Program Fee" value={`₹${summary.programFee.toFixed(2)}`} />
        <SummaryRow label={`Participants (${qty})`} value={`× ${qty}`} />
        <SummaryRow label={`Platform Fee (${(platformRate * 100).toFixed(1)}%)`} value={`₹${summary.platformFee.toFixed(2)}`} />
        <SummaryRow label="Discount" value="- ₹0.00" />
        <Separator />
        <SummaryRow label="Total Amount Payable" value={`₹${summary.total.toFixed(2)}`} bold accent />
      </div>

      {/* Payment Method */}
      <div className="space-y-2">
        <h4 className="font-bold text-xs text-foreground">Payment Method</h4>
        <button
          type="button"
          onClick={onPayClick}
          className="w-full flex items-center justify-between p-4 border-2 border-primary/40 bg-primary/5 rounded-xl hover:bg-primary/10 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-[#072654] rounded-lg flex items-center justify-center">
              <CreditCard className="h-4 w-4 text-white" />
            </div>
            <div className="text-left">
              <div className="text-sm font-bold text-foreground">Razorpay</div>
              <div className="text-[10px] text-muted-foreground">Cards, UPI, Wallets &amp; Net Banking</div>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        </button>
      </div>

      {/* Terms & Conditions */}
      <div className="space-y-3 pt-1">
        <h4 className="font-bold text-xs text-foreground">Terms &amp; Conditions</h4>
        {checkboxes.map(({ id, checked, onChange, label }) => (
          <label key={id} className="flex items-start gap-2.5 cursor-pointer group">
            <input
              type="checkbox"
              id={id}
              checked={checked}
              onChange={e => onChange(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border border-border cursor-pointer"
            />
            <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
              {label}
            </span>
          </label>
        ))}
      </div>

      {/* Warning */}
      {!canProceed && (
        <div className="flex items-center gap-2 text-[11px] text-amber-600 bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-lg">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          Please accept Terms &amp; Conditions and Refund Policy to proceed.
        </div>
      )}
    </div>
  );
}
