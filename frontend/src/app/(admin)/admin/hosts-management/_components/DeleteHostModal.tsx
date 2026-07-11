import React from "react";
import { UserX } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeleteHostModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteHostModal({
  isOpen,
  onOpenChange,
  onConfirm,
  onCancel
}: DeleteHostModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-base font-extrabold text-destructive flex items-center gap-2">
            <UserX className="h-5 w-5" /> Remove Host From Registry?
          </DialogTitle>
          <DialogDescription className="text-xs">
            This action is destructive. This will remove this educator from the local registry records permanently.
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
            variant="destructive"
            className="text-xs font-semibold h-9 rounded-xl"
            onClick={onConfirm}
          >
            Confirm Permanent Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
