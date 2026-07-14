import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { BankDetailsPayload } from "@/features/host/api/types";

interface BankDetailsFormProps {
  form: BankDetailsPayload;
  isLoading: boolean;
  isEdit: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function BankDetailsForm({ form, isLoading, isEdit, onChange, onSubmit }: BankDetailsFormProps) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col h-full">
      <div className="mb-4">
        <h3 className="text-[#0b0c01] font-extrabold text-sm mb-1">
          {isEdit ? "Update Bank Account" : "Link Bank Account"}
        </h3>
        <p className="text-[10px] font-semibold text-muted-foreground/80">
          All sensitive data is encrypted at rest per PCI DSS standards.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 flex-1">
        <div className="space-y-1">
          <Label htmlFor="accountHolderName" className="text-[10px] font-bold text-[#0b0c01]/70">Account Holder</Label>
          <Input id="accountHolderName" name="accountHolderName" placeholder="John Doe" 
            className="h-8 text-[11px] bg-white/50 border-[#a78bfa]/20 focus-visible:ring-[#a78bfa]/50" 
            value={form.accountHolderName} onChange={onChange} required disabled={isLoading} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="bankName" className="text-[10px] font-bold text-[#0b0c01]/70">Bank Name</Label>
          <Input id="bankName" name="bankName" placeholder="HDFC Bank" 
            className="h-8 text-[11px] bg-white/50 border-[#a78bfa]/20 focus-visible:ring-[#a78bfa]/50" 
            value={form.bankName} onChange={onChange} required disabled={isLoading} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="accountNumber" className="text-[10px] font-bold text-[#0b0c01]/70">Account Number</Label>
          <Input id="accountNumber" name="accountNumber" placeholder="XXXX XXXX XXXX" 
            className="h-8 text-[11px] bg-white/50 border-[#a78bfa]/20 focus-visible:ring-[#a78bfa]/50" 
            value={form.accountNumber} onChange={onChange} required disabled={isLoading} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="ifscCode" className="text-[10px] font-bold text-[#0b0c01]/70">IFSC Code</Label>
          <Input id="ifscCode" name="ifscCode" placeholder="HDFC0001234" 
            className="h-8 text-[11px] bg-white/50 border-[#a78bfa]/20 focus-visible:ring-[#a78bfa]/50" 
            value={form.ifscCode} onChange={onChange} required disabled={isLoading} />
        </div>
        <div className="space-y-1 sm:col-span-2">
          <Label htmlFor="upiId" className="text-[10px] font-bold text-[#0b0c01]/70">UPI ID <span className="opacity-50">(optional)</span></Label>
          <Input id="upiId" name="upiId" placeholder="you@upi" 
            className="h-8 text-[11px] bg-white/50 border-[#a78bfa]/20 focus-visible:ring-[#a78bfa]/50" 
            value={form.upiId ?? ""} onChange={onChange} disabled={isLoading} />
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <Button type="submit" className="text-[11px] font-bold rounded-lg h-8 px-6 bg-[#0b0c01] hover:bg-black/80 text-white shadow-sm" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Details"}
        </Button>
      </div>
    </form>
  );
}
