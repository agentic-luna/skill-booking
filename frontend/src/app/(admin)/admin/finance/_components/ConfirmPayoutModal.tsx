"use client";

import React, { useState, useEffect } from "react";
import { AlertCircle, RefreshCw, ShieldAlert, Landmark, QrCode, Copy, Check, Zap, Info, Calendar } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ConfirmPayoutModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedEvent: any | null;
  payoutLoading: boolean;
  onConfirm: (eventId: string, mode: "AUTOMATIC" | "MANUAL", manualRef?: string) => void;
  onCancel: () => void;
}

export default function ConfirmPayoutModal({
  isOpen,
  onOpenChange,
  selectedEvent,
  payoutLoading,
  onConfirm,
  onCancel,
}: ConfirmPayoutModalProps) {
  const [payoutMode, setPayoutMode] = useState<"AUTOMATIC" | "MANUAL">("MANUAL"); // Manual default!
  const [manualRef, setManualRef] = useState("");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPayoutMode("MANUAL");
      setManualRef("");
      setCopiedField(null);
    }
  }, [isOpen]);

  if (!selectedEvent) return null;

  const bank = selectedEvent.bankDetail;
  const amountToPay = selectedEvent.hostPayableAmount || 0;

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
            <ShieldAlert className="h-5 w-5 text-[#a0f212]" /> Disburse Workshop Escrow Payout
          </DialogTitle>
          <DialogDescription className="text-xs">
            Release held ticket revenue for workshop "{selectedEvent.eventTitle}" to instructor {selectedEvent.hostName}.
          </DialogDescription>
        </DialogHeader>

        <div className="py-2 space-y-4 text-xs">
          
          {/* Mode Switcher with Automatic Disabled */}
          <div className="space-y-2">
            <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Disbursement Mode</Label>
            <div className="flex bg-muted/40 p-1 rounded-xl border border-black/5 dark:border-white/5 gap-1">
              <button
                type="button"
                onClick={() => setPayoutMode("MANUAL")}
                className={`flex-1 py-2 rounded-lg font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 ${
                  payoutMode === "MANUAL"
                    ? "bg-card text-foreground shadow-xs border border-black/5 dark:border-white/5"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Landmark className="h-3.5 w-3.5 text-blue-500" /> Manual Bank / UPI Payout
              </button>

              <button
                type="button"
                disabled={true}
                className="flex-1 py-2 rounded-lg font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 opacity-50 cursor-not-allowed bg-muted/20 text-muted-foreground relative"
                title="Reserved for future automated enterprise finance integration"
              >
                <Zap className="h-3.5 w-3.5 text-muted-foreground" /> Automatic (Razorpay X)
                <span className="text-[9px] bg-muted px-1.5 py-0.2 rounded font-mono font-normal">Future</span>
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground italic flex items-center gap-1">
              <Info className="h-3 w-3 shrink-0 text-blue-500" />
              Automatic Razorpay X feature is reserved for future automated enterprise finance integration. Process using Manual Payout below.
            </p>
          </div>

          {/* Amount Needed to Pay Host for THIS Event */}
          <div className="bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-xl flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-extrabold text-emerald-800 dark:text-emerald-300 text-xs uppercase tracking-wider">
                Event Payout Amount Needed:
              </span>
              <span className="text-[10px] text-emerald-700/80 dark:text-emerald-400/80 font-medium">
                {selectedEvent.totalBookings || 0} Tickets Sold • Gross Revenue: ₹{Number(selectedEvent.totalRevenue || 0).toLocaleString()}
              </span>
            </div>
            <span className="font-mono font-black text-lg text-emerald-700 dark:text-[#a0f212]">
              ₹{Number(amountToPay).toLocaleString()} INR
            </span>
          </div>

          {/* Event & Host Card */}
          <div className="bg-card border border-black/5 dark:border-white/5 p-4 rounded-xl space-y-2.5">
            <div className="flex justify-between items-center border-b border-black/5 dark:border-white/5 pb-2">
              <span className="text-muted-foreground font-semibold">Workshop Event:</span>
              <span className="font-bold text-foreground max-w-[220px] truncate">{selectedEvent.eventTitle}</span>
            </div>

            <div className="flex justify-between items-center border-b border-black/5 dark:border-white/5 pb-2">
              <span className="text-muted-foreground font-semibold">Instructor Host:</span>
              <span className="font-bold text-foreground">{selectedEvent.hostName} ({selectedEvent.hostEmail})</span>
            </div>

            {/* UPI ID Row */}
            <div className="flex justify-between items-center bg-emerald-500/5 border border-emerald-500/20 p-2.5 rounded-lg">
              <div className="flex items-center gap-1.5 text-emerald-700 dark:text-[#a0f212] font-extrabold">
                <QrCode className="h-4 w-4" />
                <span>Host UPI ID:</span>
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
            <div className="space-y-1.5 pt-1 text-[11px]">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground font-semibold">Bank Name:</span>
                <span className="font-bold text-foreground">{bank?.bankName || "N/A"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground font-semibold">A/C Holder:</span>
                <span className="font-mono font-bold text-foreground">{bank?.accountHolderName || "N/A"}</span>
              </div>
              <div className="flex justify-between items-center">
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
              <div className="flex justify-between items-center">
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

          {/* Proper Manual Payout Message */}
          <div className="space-y-3 bg-muted/20 border p-3.5 rounded-xl">
            <div className="flex items-start gap-2 text-muted-foreground text-[11px] leading-relaxed">
              <AlertCircle className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
              <span>
                Transfer <strong className="text-foreground">₹{Number(amountToPay).toLocaleString()} INR</strong> directly to the host's UPI ID or Bank A/C for event "{selectedEvent.eventTitle}", then enter the UTR/Reference number below to confirm manual release.
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
            onClick={() => onConfirm(selectedEvent.eventId || selectedEvent.id, "MANUAL", manualRef)}
            disabled={payoutLoading}
          >
            {payoutLoading && <RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
            Confirm Manual Release
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
