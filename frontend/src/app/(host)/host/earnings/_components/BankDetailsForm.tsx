import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Landmark } from "lucide-react";
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
    <Card className="border-border/40 rounded-2xl bg-card">
      <form onSubmit={onSubmit}>
        <CardHeader>
          <CardTitle className="text-sm font-bold flex items-center gap-1.5">
            <Landmark className="h-4 w-4 text-primary" />
            {isEdit ? "Update Bank Account Details" : "Link Bank Account"}
          </CardTitle>
          <CardDescription className="text-xs">
            {isEdit
              ? "Update your encrypted bank account details. All sensitive data is encrypted at rest."
              : "Submit your bank account details. Information is encrypted at rest per PCI DSS standards."}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="accountHolderName" className="text-xs">Account Holder Name</Label>
            <Input id="accountHolderName" name="accountHolderName" placeholder="John Doe" className="h-9 text-xs" value={form.accountHolderName} onChange={onChange} required disabled={isLoading} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bankName" className="text-xs">Bank Name</Label>
            <Input id="bankName" name="bankName" placeholder="HDFC Bank" className="h-9 text-xs" value={form.bankName} onChange={onChange} required disabled={isLoading} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="accountNumber" className="text-xs">Account Number</Label>
            <Input id="accountNumber" name="accountNumber" placeholder="XXXX XXXX XXXX" className="h-9 text-xs" value={form.accountNumber} onChange={onChange} required disabled={isLoading} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ifscCode" className="text-xs">IFSC Code</Label>
            <Input id="ifscCode" name="ifscCode" placeholder="HDFC0001234" className="h-9 text-xs" value={form.ifscCode} onChange={onChange} required disabled={isLoading} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="upiId" className="text-xs">
              UPI ID <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input id="upiId" name="upiId" placeholder="you@upi" className="h-9 text-xs" value={form.upiId ?? ""} onChange={onChange} disabled={isLoading} />
          </div>
        </CardContent>
        <CardFooter className="justify-end border-t pt-4">
          <Button type="submit" className="text-xs font-semibold rounded-lg h-9 px-6" disabled={isLoading}>
            {isLoading
              ? (isEdit ? "Updating..." : "Saving...")
              : (isEdit ? "Update Bank Details" : "Save Bank Details")}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
