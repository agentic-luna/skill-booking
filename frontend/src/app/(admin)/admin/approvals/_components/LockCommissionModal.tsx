import React from "react";
import { ShieldAlert } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface LockCommissionModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function LockCommissionModal({
  isOpen,
  onOpenChange,
  onConfirm,
  onCancel
}: LockCommissionModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl z-[9999]">
        <DialogHeader>
          <DialogTitle className="text-base font-extrabold flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-primary" /> Approve Event
          </DialogTitle>
          <DialogDescription className="text-xs">
            The platform fee will be applied based on the commission settings configured in the admin settings. Are you sure you want to approve this event?
          </DialogDescription>
        </DialogHeader>

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
            className="text-xs font-semibold h-9 rounded-xl shadow-xs"
            onClick={onConfirm}
          >
            Confirm &amp; Approve Event
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
