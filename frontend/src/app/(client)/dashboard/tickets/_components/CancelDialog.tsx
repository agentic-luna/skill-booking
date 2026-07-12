import React from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import AlertBox from "@/components/ui/alert-box";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

interface CancelDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function CancelDialog({ open, onClose, onConfirm }: CancelDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <span>Cancel Reservation?</span>
          </DialogTitle>
          <DialogDescription className="text-xs">
            Review cancellation parameters before finalizing.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Are you sure you want to cancel this booking? This will remove your reservation,
            and you will receive a 100% automatic refund to your original payment method.
          </p>
          <AlertBox
            variant="warning"
            description="Cancellations are permanent. If you change your mind, you will need to re-book and pay for the ticket again (subject to seat availability)."
          />
        </div>

        <DialogFooter className="pt-2 gap-2 sm:gap-0">
          <Button variant="outline" type="button" className="text-xs h-9 rounded-xl" onClick={onClose}>
            No, Keep Ticket
          </Button>
          <Button variant="destructive" className="text-xs h-9 rounded-xl font-semibold" onClick={onConfirm}>
            Yes, Cancel Booking
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
