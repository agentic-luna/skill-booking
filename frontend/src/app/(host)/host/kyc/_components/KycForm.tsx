import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, FileText, Landmark, ShieldCheck } from "lucide-react";
import type { KycAccountType, BankDetailsPayload } from "@/features/host/api/types";

interface KycFormValues {
  accountType: KycAccountType;
  govIdUrl: string;
  gstNumber: string;
  bio: string;
}

interface KycFormProps {
  form: KycFormValues;
  bankForm: BankDetailsPayload;
  isLoading: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onBankChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export default function KycForm({ form, bankForm, isLoading, onChange, onBankChange, onSubmit, onCancel }: KycFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-5">

      {/* ── Section 1: Identity & Profile ──────────────────────────────── */}
      <Card className="border-border/40 rounded-2xl bg-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-sm font-bold flex items-center gap-1.5">
            <FileText className="h-4 w-4 text-primary" /> Identity & Profile Details
          </CardTitle>
          <CardDescription className="text-xs">
            All documents are securely stored and used only for identity verification purposes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">

          <div className="space-y-1.5">
            <Label htmlFor="accountType" className="text-xs">Account Type</Label>
            <select
              id="accountType" name="accountType" value={form.accountType}
              onChange={onChange} disabled={isLoading}
              className="w-full h-9 text-xs rounded-md border border-input bg-background px-3 py-1 focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="INDIVIDUAL">Individual</option>
              <option value="COMPANY">Company / Business</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="govIdUrl" className="text-xs">Government ID Document URL <span className="text-destructive">*</span></Label>
            <Input id="govIdUrl" name="govIdUrl" placeholder="https://storage.example.com/your-id-scan.pdf" className="h-9 text-xs" value={form.govIdUrl} onChange={onChange} required disabled={isLoading} />
            <p className="text-[10px] text-muted-foreground">Upload your Passport, National ID, or Driver&apos;s License and paste the link here.</p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="gstNumber" className="text-xs">
              GST Number <span className="text-muted-foreground">(optional, for businesses)</span>
            </Label>
            <Input id="gstNumber" name="gstNumber" placeholder="22AAAAA0000A1Z5" className="h-9 text-xs" value={form.gstNumber} onChange={onChange} disabled={isLoading} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="bio" className="text-xs">
              Professional Bio <span className="text-muted-foreground">(optional)</span>
            </Label>
            <textarea
              id="bio" name="bio" rows={4}
              placeholder="Tell learners about your expertise, certifications, and teaching style..."
              className="w-full text-xs rounded-md border border-input bg-background px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              value={form.bio} onChange={onChange} disabled={isLoading}
            />
          </div>

        </CardContent>
      </Card>

      {/* ── Section 2: Bank Details (Required for Payouts) ─────────────── */}
      <Card className="border-border/40 rounded-2xl bg-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-sm font-bold flex items-center gap-1.5">
            <Landmark className="h-4 w-4 text-primary" /> Bank Account Details
          </CardTitle>
          <CardDescription className="text-xs">
            Required for receiving payouts. Your account details are encrypted and used solely for fund transfers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">

            <div className="space-y-1.5">
              <Label htmlFor="accountHolderName" className="text-xs">
                Account Holder Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="accountHolderName" name="accountHolderName"
                placeholder="John Doe"
                className="h-9 text-xs"
                value={bankForm.accountHolderName}
                onChange={onBankChange}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bankName" className="text-xs">
                Bank Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="bankName" name="bankName"
                placeholder="HDFC Bank"
                className="h-9 text-xs"
                value={bankForm.bankName}
                onChange={onBankChange}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="accountNumber" className="text-xs">
                Account Number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="accountNumber" name="accountNumber"
                placeholder="XXXX XXXX XXXX"
                className="h-9 text-xs"
                value={bankForm.accountNumber}
                onChange={onBankChange}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ifscCode" className="text-xs">
                IFSC Code <span className="text-destructive">*</span>
              </Label>
              <Input
                id="ifscCode" name="ifscCode"
                placeholder="HDFC0001234"
                className="h-9 text-xs"
                value={bankForm.ifscCode}
                onChange={onBankChange}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="upiId" className="text-xs">
                UPI ID <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="upiId" name="upiId"
                placeholder="you@upi"
                className="h-9 text-xs"
                value={bankForm.upiId ?? ""}
                onChange={onBankChange}
                disabled={isLoading}
              />
            </div>

          </div>

          <div className="mt-4 flex items-start gap-2 p-3 bg-muted/40 rounded-xl border border-border/20">
            <ShieldCheck className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
            <p className="text-[10px] text-muted-foreground leading-relaxed font-medium">
              All sensitive banking data is encrypted at rest per PCI DSS standards. This information is never shared with third parties.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <div className="flex justify-end gap-3 pt-1">
        <Button type="button" variant="outline" className="text-xs h-9" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" className="text-xs font-semibold h-9 px-6" disabled={isLoading}>
          {isLoading
            ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Submitting...</>
            : "Submit KYC & Bank Details"}
        </Button>
      </div>
    </form>
  );
}

