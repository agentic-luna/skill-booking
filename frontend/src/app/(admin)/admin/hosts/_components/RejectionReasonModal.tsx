import React from "react";
import { AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface RejectionReasonModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  rejectionReason: string;
  onReasonChange: (val: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function RejectionReasonModal({
  isOpen,
  onOpenChange,
  rejectionReason,
  onReasonChange,
  onConfirm,
  onCancel
}: RejectionReasonModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-base font-extrabold text-destructive flex items-center gap-2">
            <AlertCircle className="h-5 w-5" /> Reject KYC Submission
          </DialogTitle>
          <DialogDescription className="text-xs">
            State a clear reason for rejection. This description will be stored in registry log.
          </DialogDescription>
        </DialogHeader>

        <div className="py-2 space-y-3">
          <label className="text-xs font-bold text-muted-foreground">Rejection Reason</label>
          <Input 
            type="text" 
            placeholder="e.g. Government ID scan is blur and details cannot be read" 
            className="h-10 rounded-xl text-xs"
            value={rejectionReason}
            onChange={(e) => onReasonChange(e.target.value)}
          />
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            type="button"
            className="text-xs h-9 rounded-xl"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button 
            variant="destructive"
            className="text-xs font-semibold h-9 rounded-xl"
            onClick={onConfirm}
          >
            Confirm Decline
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
