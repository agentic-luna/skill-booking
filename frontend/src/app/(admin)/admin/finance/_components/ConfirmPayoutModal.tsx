import React from "react";
import { AlertCircle, RefreshCw, ShieldAlert } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { HostWithProfile } from "@/features/admin/api/types";

interface ConfirmPayoutModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedHost: HostWithProfile | null;
  payoutLoading: boolean;
  onConfirm: (hostId: string) => void;
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
  if (!selectedHost) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-base font-extrabold flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-amber-500" /> Disburse Escrow Payout?
          </DialogTitle>
          <DialogDescription className="text-xs">
            You are releasing accumulated pending event escrows to this Host bank account.
          </DialogDescription>
        </DialogHeader>

        <div className="py-3 space-y-4 text-xs">
          <div className="bg-muted/30 border p-3.5 rounded-xl space-y-2">
            <div className="flex justify-between border-b pb-1.5">
              <span className="text-muted-foreground">Beneficiary Host:</span>
              <span className="font-bold text-foreground">{selectedHost.firstName} {selectedHost.lastName}</span>
            </div>
            <div className="flex justify-between border-b pb-1.5">
              <span className="text-muted-foreground">Bank Name:</span>
              <span className="font-bold text-foreground">{selectedHost.hostProfile?.bankDetail?.bankName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">A/C Holder Name:</span>
              <span className="font-mono font-bold text-foreground">{selectedHost.hostProfile?.bankDetail?.accountHolderName}</span>
            </div>
          </div>

          <div className="p-3 border border-amber-500/20 bg-amber-500/5 rounded-xl text-amber-700 text-[11px] leading-relaxed flex gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
            <span>
              This command triggers an asynchronous bank transfer via **Razorpay Payouts API**. Once confirmed, status transitions to `RELEASED_TO_HOST` for all pending txn ledger items.
            </span>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
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
            className="text-xs font-semibold h-9 rounded-xl shadow-xs"
            onClick={() => onConfirm(selectedHost.id)}
            disabled={payoutLoading}
          >
            {payoutLoading && <RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
            Confirm Transfer Release
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
