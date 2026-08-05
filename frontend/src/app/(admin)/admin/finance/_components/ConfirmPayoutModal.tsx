"use client";

import React, { useState, useEffect } from "react";
import { AlertCircle, RefreshCw, ShieldAlert, CreditCard, Landmark, QrCode, Copy, Check, Zap } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HostWithProfile } from "@/features/admin/api/types";

interface ConfirmPayoutModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedHost: HostWithProfile | null;
  payoutLoading: boolean;
  onConfirm: (hostId: string, mode: "AUTOMATIC" | "MANUAL", manualRef?: string) => void;
  onCancel: () => void;
}

export default function ConfirmPayoutModal({
  isOpen,
  onOpenChange,
  selectedHost,
  payoutLoading,
  onConfirm,
  onCancel,
}: ConfirmPayoutModalProps) {
  const [payoutMode, setPayoutMode] = useState<"AUTOMATIC" | "MANUAL">("AUTOMATIC");
  const [manualRef, setManualRef] = useState("");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPayoutMode("AUTOMATIC");
      setManualRef("");
      setCopiedField(null);
    }
  }, [isOpen]);

  if (!selectedHost) return null;

  const bank = selectedHost.hostProfile?.bankDetail;

  const copyToClipboard = (text: string, fieldName: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-base font-extrabold flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-[#a0f212]" /> Disburse Escrow Host Payout
          </DialogTitle>
          <DialogDescription className="text-xs">
            Release accumulated pending event escrows to {selectedHost.firstName} {selectedHost.lastName}.
          </DialogDescription>
        </DialogHeader>

        <div className="py-2 space-y-4 text-xs">
          
          {/* Payout Mode Switcher */}
          <div className="flex bg-muted/40 p-1 rounded-xl border border-black/5 dark:border-white/5">
            <button
              type="button"
              onClick={() => setPayoutMode("AUTOMATIC")}
              className={`flex-1 py-2 rounded-lg font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 ${
                payoutMode === "AUTOMATIC"
                  ? "bg-card text-foreground shadow-sm border border-black/5 dark:border-white/5"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Zap className="h-3.5 w-3.5 text-[#a0f212]" /> Automatic (Razorpay X)
            </button>
            <button
              type="button"
              onClick={() => setPayoutMode("MANUAL")}
              className={`flex-1 py-2 rounded-lg font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 ${
                payoutMode === "MANUAL"
                  ? "bg-card text-foreground shadow-sm border border-black/5 dark:border-white/5"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Landmark className="h-3.5 w-3.5 text-blue-500" /> Manual Bank / UPI
            </button>
          </div>

          {/* Host Bank & UPI Details Card */}
          <div className="bg-card border border-black/5 dark:border-white/5 p-4 rounded-xl space-y-2.5">
            <div className="flex justify-between items-center border-b border-black/5 dark:border-white/5 pb-2">
              <span className="text-muted-foreground font-semibold">Beneficiary Host</span>
              <span className="font-bold text-foreground">{selectedHost.firstName} {selectedHost.lastName}</span>
            </div>

            {/* UPI ID Row */}
            <div className="flex justify-between items-center bg-emerald-500/5 border border-emerald-500/20 p-2.5 rounded-lg">
              <div className="flex items-center gap-1.5 text-emerald-700 dark:text-[#a0f212] font-extrabold">
                <QrCode className="h-4 w-4" />
                <span>UPI ID / VPA:</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-foreground text-xs">{bank?.upiId || "Not Provided"}</span>
                {bank?.upiId && (
                  <button
                    type="button"
                    onClick={() => copyToClipboard(bank.upiId!, "upi")}
                    className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors"
                    title="Copy UPI ID"
                  >
                    {copiedField === "upi" ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                )}
              </div>
            </div>

            {/* Bank Details Rows */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-muted-foreground font-semibold">Bank Name:</span>
                <span className="font-bold text-foreground">{bank?.bankName || "N/A"}</span>
              </div>

              <div className="flex justify-between items-center text-[11px]">
                <span className="text-muted-foreground font-semibold">A/C Holder:</span>
                <span className="font-mono font-bold text-foreground">{bank?.accountHolderName || "N/A"}</span>
              </div>

              <div className="flex justify-between items-center text-[11px]">
                <span className="text-muted-foreground font-semibold">Account Number:</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-foreground">{bank?.accountNumber || "N/A"}</span>
                  {bank?.accountNumber && (
                    <button
                      type="button"
                      onClick={() => copyToClipboard(bank.accountNumber!, "account")}
                      className="p-0.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors"
                      title="Copy Account Number"
                    >
                      {copiedField === "account" ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                    </button>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center text-[11px]">
                <span className="text-muted-foreground font-semibold">IFSC Code:</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-foreground">{bank?.ifscCode || "N/A"}</span>
                  {bank?.ifscCode && (
                    <button
                      type="button"
                      onClick={() => copyToClipboard(bank.ifscCode!, "ifsc")}
                      className="p-0.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors"
                      title="Copy IFSC Code"
                    >
                      {copiedField === "ifsc" ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Mode specific instructions & inputs */}
          {payoutMode === "AUTOMATIC" ? (
            <div className="p-3 border border-emerald-500/20 bg-emerald-500/5 rounded-xl text-emerald-700 dark:text-emerald-300 text-[11px] leading-relaxed flex gap-2">
              <Zap className="h-4 w-4 shrink-0 text-[#a0f212] mt-0.5" />
              <span>
                Executes automated transfer via <span className="font-bold">Razorpay Payouts API</span> directly to the host's bank account.
              </span>
            </div>
          ) : (
            <div className="space-y-3 bg-muted/20 border p-3.5 rounded-xl">
              <div className="flex items-start gap-2 text-muted-foreground text-[11px]">
                <AlertCircle className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                <span>
                  Perform transfer directly using your preferred banking app (UPI/NEFT/IMPS) using the bank details or UPI ID above.
                </span>
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] font-bold">Transaction Reference / UTR Number (Optional)</Label>
                <Input
                  placeholder="e.g. UTR1984729103 or UPI Ref 839201"
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
            disabled={payoutLoading}
          >
            Cancel
          </Button>
          <Button 
            className="text-xs font-bold h-9 rounded-xl shadow-xs bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => onConfirm(selectedHost.id, payoutMode, manualRef)}
            disabled={payoutLoading}
          >
            {payoutLoading && <RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
            {payoutMode === "AUTOMATIC" ? "Confirm Razorpay Payout" : "Confirm Manual Release"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
