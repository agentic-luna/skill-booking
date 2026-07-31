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
      <DialogContent className="max-w-md p-6 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5 text-destructive animate-pulse" />
            <span>Cancel Reservation?</span>
          </DialogTitle>
          <DialogDescription className="text-xs">
            Review cancellation parameters and refund policy below.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-10 space-y-2">
            <Loader2 className="h-6 w-6 text-primary animate-spin" />
            <span className="text-xs text-muted-foreground font-semibold">Calculating refund quote...</span>
          </div>
        ) : error ? (
          <div className="py-2">
            <AlertBox variant="destructive" description={error} />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            {quote && (
              <div className="p-4 bg-muted/40 rounded-xl border border-border/20 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground font-medium">Ticket Price</span>
                  <span className="font-bold text-foreground">₹{quote.totalAmount}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground font-medium">Refund Percentage</span>
                  <span className="font-bold text-foreground">{quote.refundPercentage}%</span>
                </div>
                <div className="border-t border-border/40 pt-2 flex justify-between text-xs">
                  <span className="text-muted-foreground font-bold">Estimated Refund</span>
                  <span className="font-black text-primary">₹{quote.refundAmount.toFixed(2)}</span>
                </div>
              </div>
            )}

            {quote && quote.refundAmount > 0 ? (
              <AlertBox
                variant="info"
                description="This refund request will be submitted to the Super Admin for approval. Once approved, the funds will return automatically to your original payment method."
              />
            ) : (
              <AlertBox
                variant="warning"
                description="Cancellations are permanent. If you cancel, you will forfeit this reservation and seats will be released."
              />
            )}

            <div className="space-y-1.5">
              <Label htmlFor="cancel-reason" className="text-xs font-bold text-muted-foreground">
                Reason for Cancellation <span className="text-destructive">*</span>
              </Label>
              <textarea
                id="cancel-reason"
                required
                placeholder="Please state why you are cancelling..."
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full rounded-xl border border-input bg-background p-3 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </div>

            <DialogFooter className="pt-2 gap-2 sm:gap-0">
              <Button variant="outline" type="button" className="text-xs h-9 rounded-xl" onClick={onClose}>
                No, Keep Ticket
              </Button>
              <Button
                variant="destructive"
                type="submit"
                disabled={!reason.trim()}
                className="text-xs h-9 rounded-xl font-semibold"
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
