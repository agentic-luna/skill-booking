import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, FileText } from "lucide-react";
import type { KycAccountType } from "@/features/host/api/types";

interface KycFormValues {
  accountType: KycAccountType;
  govIdUrl: string;
  gstNumber: string;
  bio: string;
}

interface KycFormProps {
  form: KycFormValues;
  isLoading: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export default function KycForm({ form, isLoading, onChange, onSubmit, onCancel }: KycFormProps) {
  return (
    <Card className="border-border/40 rounded-2xl bg-card">
      <form onSubmit={onSubmit}>
        <CardHeader>
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
            <Label htmlFor="govIdUrl" className="text-xs">Government ID Document URL</Label>
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
        <CardFooter className="justify-end border-t pt-4 gap-3">
          <Button type="button" variant="outline" className="text-xs h-9" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" className="text-xs font-semibold h-9 px-6" disabled={isLoading}>
            {isLoading
              ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Submitting...</>
              : "Submit KYC Documents"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
