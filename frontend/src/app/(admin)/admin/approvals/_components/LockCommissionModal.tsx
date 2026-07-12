import React from "react";
import { ShieldAlert } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface LockCommissionModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  commissionType: "PERCENTAGE" | "FIXED";
  onCommissionTypeChange: (val: "PERCENTAGE" | "FIXED") => void;
  platformValue: string;
  onPlatformValueChange: (val: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function LockCommissionModal({
  isOpen,
  onOpenChange,
  commissionType,
  onCommissionTypeChange,
  platformValue,
  onPlatformValueChange,
  onConfirm,
  onCancel
}: LockCommissionModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-base font-extrabold flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-primary" /> Lock Commission Structure
          </DialogTitle>
          <DialogDescription className="text-xs">
            Determine the platform fee structures that will bind booking checkouts.
          </DialogDescription>
        </DialogHeader>

        <div className="py-3 space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-muted-foreground">Commission Type</label>
            <Select 
              value={commissionType} 
              onValueChange={(val: any) => onCommissionTypeChange(val)}
            >
              <SelectTrigger className="h-9 rounded-xl text-xs bg-card border">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                <SelectItem value="FIXED">Fixed Flat Fee ($)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-muted-foreground">
              {commissionType === "PERCENTAGE" ? "Platform Share Value (%)" : "Platform Share Amount ($)"}
            </label>
            <Input
              type="number"
              placeholder={commissionType === "PERCENTAGE" ? "10" : "50"}
              className="h-9 rounded-xl text-xs"
              value={platformValue}
              onChange={(e) => onPlatformValueChange(e.target.value)}
            />
            <p className="text-[10px] text-muted-foreground/80 mt-1">
              {commissionType === "PERCENTAGE" 
                ? "Subtracts a percentage cut off every participant payment." 
                : "Charges a flat transaction fee independent of booking sizes."}
            </p>
          </div>
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
            className="text-xs font-semibold h-9 rounded-xl shadow-xs"
            onClick={onConfirm}
          >
            Confirm & Approve Event
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
