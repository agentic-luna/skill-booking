"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useHostStore } from "@/features/host/store/hostStore";
import { useAlertStore } from "@/features/alerts/store/alertStore";
import type { KycAccountType } from "@/features/host/api/types";
import KycForm from "./_components/KycForm";

export default function HostKycPage() {
  const router = useRouter();
  const showAlert = useAlertStore((s) => s.showAlert);
  const { kyc, submitKyc, isLoading, error, clearError } = useHostStore();

  const [form, setForm] = useState({
    accountType: "INDIVIDUAL" as KycAccountType,
    govIdUrl: "",
    gstNumber: "",
    bio: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      await submitKyc({
        accountType: form.accountType,
        govIdUrl: form.govIdUrl,
        gstNumber: form.gstNumber || undefined,
        bio: form.bio || undefined,
      });
      showAlert("KYC Submitted", "Your verification documents are under review. We will notify you within 2-3 business days.", "success");
      router.push("/host/dashboard");
    } catch { /* error shown via banner */ }
  };

  if (kyc) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4 text-center">
        <div className="p-4 rounded-full bg-emerald-500/10">
          <CheckCircle2 className="h-10 w-10 text-emerald-500" />
        </div>
        <h1 className="text-2xl font-extrabold text-foreground">KYC Already Submitted</h1>
        <p className="text-sm text-muted-foreground max-w-sm">
          Your KYC is currently <strong className="capitalize">{kyc.kycStatus.toLowerCase()}</strong>. Our team will review your documents shortly.
        </p>
        <Button onClick={() => router.push("/host/dashboard")} className="mt-4">Back to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-primary" /> KYC Verification
        </h1>
        <p className="text-sm text-muted-foreground">Submit your identity documents to unlock host capabilities on the platform.</p>
      </div>

      {error && (
        <div className="p-3 text-xs font-medium text-destructive bg-destructive/10 rounded-lg border border-destructive/20">
          {error}
        </div>
      )}

      <KycForm
        form={form}
        isLoading={isLoading}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onCancel={() => router.push("/host/dashboard")}
      />
    </div>
  );
}
