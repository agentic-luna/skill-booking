"use client";

import React from "react";
import { CreditCard, CheckCircle2, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { BookingSummary } from "./types";

interface RazorpayMockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  summary: BookingSummary;
  programTitle: string;
  qty: number;
  loading: boolean;
  onApprove: () => void;
  onDecline: () => void;
}

export default function RazorpayMockDialog({
  open,
  onOpenChange,
  summary,
  programTitle,
  qty,
  loading,
  onApprove,
  onDecline,
}: RazorpayMockDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="h-8 w-8 bg-[#072654] rounded-lg flex items-center justify-center">
              <CreditCard className="h-4 w-4 text-white" />
            </div>
            Razorpay Payment
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground pt-1">
            Razorpay integration is coming soon. Simulate a payment result for testing:
          </DialogDescription>
        </DialogHeader>

        {/* Mini Receipt */}
        <div className="bg-muted/30 rounded-xl border p-4 space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Amount</span>
            <span className="font-bold text-foreground">₹{summary.total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Program</span>
            <span className="font-semibold text-foreground max-w-[180px] truncate">{programTitle}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Seats</span>
            <span className="font-semibold text-foreground">{qty}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <Button
            variant="outline"
            onClick={onDecline}
            disabled={loading}
            className="flex-1 h-10 rounded-xl text-xs border-destructive/30 text-destructive hover:bg-destructive/5"
          >
            <X className="h-4 w-4 mr-1.5" /> Decline
          </Button>
          <Button
            onClick={onApprove}
            disabled={loading}
            className="flex-1 h-10 rounded-xl text-xs bg-emerald-600 hover:bg-emerald-700"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <><CheckCircle2 className="h-4 w-4 mr-1.5" /> Approve</>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
