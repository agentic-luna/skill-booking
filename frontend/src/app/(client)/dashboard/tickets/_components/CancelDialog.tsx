"use client";

import React, { useState, useEffect } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import AlertBox from "@/components/ui/alert-box";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useClientStore } from "@/features/client/store/clientStore";

interface CancelDialogProps {
  open: boolean;
  onClose: () => void;
  booking: any;
  onConfirm: (reason: string) => void;
}

export default function CancelDialog({ open, onClose, booking, onConfirm }: CancelDialogProps) {
  const { getCancellationQuote } = useClientStore();
  const [quote, setQuote] = useState<{
    totalAmount: number;
    refundPercentage: number;
    refundAmount: number;
    hoursDiff: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && booking?.id) {
      setLoading(true);
      setError(null);
      getCancellationQuote(booking.id)
        .then((q) => {
          setQuote(q);
        })
        .catch((err) => {
          setError(err.message || "Failed to load cancellation quote.");
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setQuote(null);
      setReason("");
      setError(null);
    }
  }, [open, booking?.id, getCancellationQuote]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;
    onConfirm(reason);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-6 rounded-2xl border border-slate-200 shadow-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5 text-red-600 animate-pulse" />
            <span>Cancel Reservation?</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Review cancellation parameters and refund policy below.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-10 space-y-2">
            <Loader2 className="h-6 w-6 text-slate-400 animate-spin" />
            <span className="text-xs text-slate-500 font-semibold">Calculating refund quote...</span>
          </div>
        ) : error ? (
          <div className="py-2">
            <AlertBox variant="destructive" description={error} />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            {quote && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 font-medium">Ticket Price</span>
                  <span className="font-bold text-slate-900">₹{quote.totalAmount}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 font-medium">Refund Percentage</span>
                  <span className="font-bold text-slate-900">{quote.refundPercentage}%</span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between text-xs">
                  <span className="text-slate-700 font-bold">Estimated Refund</span>
                  <span className="font-black text-slate-900">₹{quote.refundAmount.toFixed(2)}</span>
                </div>
              </div>
            )}

            {quote && quote.refundAmount > 0 ? (
              <AlertBox
                variant="info"
                description="This refund request will be submitted for review. Once approved, the funds will return automatically to your original payment method."
              />
            ) : (
              <AlertBox
                variant="warning"
                description="Cancellations are permanent. If you cancel, you will forfeit this reservation and seats will be released."
              />
            )}

            <div className="space-y-1.5">
              <Label htmlFor="cancel-reason" className="text-xs font-bold text-slate-700">
                Reason for Cancellation <span className="text-red-500">*</span>
              </Label>
              <textarea
                id="cancel-reason"
                required
                placeholder="Please state why you are cancelling..."
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs focus:ring-1 focus:ring-red-500 focus:border-red-500 focus:outline-none transition-colors"
              />
            </div>

            <DialogFooter className="pt-2 gap-2 sm:gap-0">
              <Button
                variant="outline"
                type="button"
                className="text-xs h-9 rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                onClick={onClose}
              >
                No, Keep Ticket
              </Button>
              <Button
                type="submit"
                disabled={!reason.trim()}
                className="text-xs h-9 rounded-xl font-semibold bg-red-600 hover:bg-red-700 text-white border-0 shadow-sm disabled:bg-red-300"
              >
                Yes, Request Cancellation
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
