"use client";

import React, { useState, useEffect } from "react";
import { AlertCircle, RefreshCw, ShieldAlert, Undo2, Landmark, Zap } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ConfirmRefundModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedRequest: any | null;
  refundLoading: boolean;
  onConfirm: (refundId: string, mode: "AUTOMATIC" | "MANUAL", manualRef?: string) => void;
  onCancel: () => void;
}

export default function ConfirmRefundModal({
  isOpen,
  onOpenChange,
  selectedRequest,
  refundLoading,
  onConfirm,
  onCancel,
}: ConfirmRefundModalProps) {
  const [refundMode, setRefundMode] = useState<"AUTOMATIC" | "MANUAL">("AUTOMATIC");
  const [manualRef, setManualRef] = useState("");

  useEffect(() => {
    if (isOpen) {
      setRefundMode("AUTOMATIC");
      setManualRef("");
    }
  }, [isOpen]);

  if (!selectedRequest) return null;

  const amount = selectedRequest.amount || "0";

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-base font-extrabold flex items-center gap-2">
            <Undo2 className="h-5 w-5 text-amber-500" /> Authorize Client Ticket Refund
          </DialogTitle>
          <DialogDescription className="text-xs">
            Reverse workshop ticket payment to client for booking #{selectedRequest.bookingRef}.
          </DialogDescription>
        </DialogHeader>

        <div className="py-2 space-y-4 text-xs">
          
          {/* Refund Mode Switcher */}
          <div className="flex bg-muted/40 p-1 rounded-xl border border-black/5 dark:border-white/5">
            <button
              type="button"
              onClick={() => setRefundMode("AUTOMATIC")}
              className={`flex-1 py-2 rounded-lg font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 ${
                refundMode === "AUTOMATIC"
                  ? "bg-card text-foreground shadow-xs border border-black/5 dark:border-white/5"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Zap className="h-3.5 w-3.5 text-[#a0f212]" /> Automatic (Razorpay)
            </button>
            <button
              type="button"
              onClick={() => setRefundMode("MANUAL")}
              className={`flex-1 py-2 rounded-lg font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 ${
                refundMode === "MANUAL"
                  ? "bg-card text-foreground shadow-xs border border-black/5 dark:border-white/5"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Landmark className="h-3.5 w-3.5 text-blue-500" /> Manual Transfer
            </button>
          </div>

          {/* Refund Summary Card */}
          <div className="bg-card border border-black/5 dark:border-white/5 p-4 rounded-xl space-y-2">
            <div className="flex justify-between items-center border-b border-black/5 dark:border-white/5 pb-2">
              <span className="text-muted-foreground font-semibold">Beneficiary Client:</span>
              <span className="font-bold text-foreground">{selectedRequest.clientName}</span>
            </div>
            <div className="flex justify-between items-center border-b border-black/5 dark:border-white/5 pb-2">
              <span className="text-muted-foreground font-semibold">Workshop Title:</span>
              <span className="font-bold text-foreground max-w-[200px] truncate">{selectedRequest.eventTitle}</span>
            </div>

            {/* Refund Amount Needed */}
            <div className="flex justify-between items-center bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-lg text-amber-700 dark:text-amber-300 font-extrabold text-sm">
              <span>Amount Needed to Refund:</span>
              <span className="font-mono font-black text-base">₹{Number(amount).toLocaleString()} INR</span>
            </div>
          </div>

          {/* Mode instructions */}
          {refundMode === "AUTOMATIC" ? (
            <div className="p-3 border border-emerald-500/20 bg-emerald-500/5 rounded-xl text-emerald-700 dark:text-emerald-300 text-[11px] leading-relaxed flex gap-2">
              <Zap className="h-4 w-4 shrink-0 text-[#a0f212] mt-0.5" />
              <span>
                Initiates automatic gateway payment reversal of <span className="font-bold">₹{amount}</span> back to client's original payment method via Razorpay.
              </span>
            </div>
          ) : (
            <div className="space-y-3 bg-muted/20 border p-3.5 rounded-xl">
              <div className="flex items-start gap-2 text-muted-foreground text-[11px]">
                <AlertCircle className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                <span>
                  Perform manual refund transfer directly to client ({selectedRequest.email}), then enter reference note below.
                </span>
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] font-bold">Transaction Reference / UTR (Optional)</Label>
                <Input
                  placeholder="e.g. UTR84920193 or UPI Ref"
                  className="h-8 text-xs font-mono rounded-lg bg-card"
                  value={manualRef}
                  onChange={(e) => setManualRef(e.target.value)}
                />
              </div>
            </div>
          )}

        </div>

        <DialogFooter className="gap-2 sm:gap-0 pt-2">
          <Button
            variant="outline"
            type="button"
            className="text-xs h-9 rounded-xl"
            onClick={onCancel}
            disabled={refundLoading}
          >
            Cancel
          </Button>
          <Button 
            className="text-xs font-bold h-9 rounded-xl shadow-xs bg-amber-500 hover:bg-amber-600 text-white"
            onClick={() => onConfirm(selectedRequest.id, refundMode, manualRef)}
            disabled={refundLoading}
          >
            {refundLoading && <RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
            {refundMode === "AUTOMATIC" ? "Approve Automatic Refund" : "Confirm Manual Refund"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
