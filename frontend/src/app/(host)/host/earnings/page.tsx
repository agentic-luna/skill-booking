"use client";

import React, { useState, useEffect } from "react";
import { DollarSign, Building2, CreditCard, ArrowUpRight, History } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useHostStore } from "@/features/host/store/hostStore";
import { useAlertStore } from "@/features/alerts/store/alertStore";
import type { BankDetailsPayload } from "@/features/host/api/types";
import BankDetailsForm from "./_components/BankDetailsForm";

const EMPTY_FORM: BankDetailsPayload = {
  accountHolderName: "", accountNumber: "", ifscCode: "", bankName: "", upiId: "",
};

export default function HostEarningsPage() {
  const showAlert = useAlertStore((s) => s.showAlert);
  const { bankDetails, fetchBankDetails, submitBankDetails, updateBankDetails, isLoading, error, clearError } = useHostStore();
  const [form, setForm] = useState<BankDetailsPayload>(EMPTY_FORM);
  const isEdit = !!bankDetails;

  useEffect(() => {
    fetchBankDetails();
  }, [fetchBankDetails]);

  useEffect(() => {
    if (bankDetails) {
      setForm({
        accountHolderName: bankDetails.accountHolderName || "",
        accountNumber: bankDetails.accountNumber || "",
        ifscCode: bankDetails.ifscCode || "",
        bankName: bankDetails.bankName || "",
        upiId: bankDetails.upiId || "",
      });
    }
  }, [bankDetails]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      if (isEdit) {
        await updateBankDetails(form);
        showAlert("Bank Details Updated", `Bank account at ${form.bankName} updated successfully.`, "success");
      } else {
        await submitBankDetails(form);
        showAlert("Bank Details Saved", `Bank account at ${form.bankName} linked to your host profile.`, "success");
      }
    } catch { /* error shown via banner */ }
  };

  return (
    <div className="space-y-6">

      <div className="space-y-1 pb-4 border-b">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
          <DollarSign className="h-6 w-6 text-primary" /> Earnings Center
        </h1>
        <p className="text-sm text-muted-foreground">Manage your finances, bank details, and withdrawal settings.</p>
      </div>

      {error && (
        <div className="p-3 text-xs font-medium text-destructive bg-destructive/10 rounded-lg border border-destructive/20">{error}</div>
      )}

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="border-border/40 bg-card rounded-2xl">
          <CardContent className="pt-6 flex justify-between items-center">
            <div className="space-y-1">
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Linked Bank</span>
              <div className="text-base font-bold text-foreground">{bankDetails ? bankDetails.bankName : "Not linked"}</div>
            </div>
            <div className="bg-primary/10 text-primary p-3 rounded-xl"><Building2 className="h-5 w-5" /></div>
          </CardContent>
        </Card>
        <Card className="border-border/40 bg-card rounded-2xl">
          <CardContent className="pt-6 flex justify-between items-center">
            <div className="space-y-1">
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Last Updated</span>
              <div className="text-base font-bold text-foreground">{bankDetails ? new Date(bankDetails.updatedAt).toLocaleDateString() : "—"}</div>
            </div>
            <div className="bg-emerald-500/10 text-emerald-500 p-3 rounded-xl"><CreditCard className="h-5 w-5" /></div>
          </CardContent>
        </Card>
        <Card className="border-primary bg-primary/5 rounded-2xl shadow-sm">
          <CardContent className="pt-6 flex justify-between items-center">
            <div className="space-y-1">
              <span className="text-[10px] text-primary font-bold uppercase tracking-wider">Account Status</span>
              <div className="text-base font-bold text-primary">{bankDetails ? "Active" : "Pending Setup"}</div>
            </div>
            <div className="bg-primary text-white p-3 rounded-xl"><ArrowUpRight className="h-5 w-5" /></div>
          </CardContent>
        </Card>
      </div>

      <BankDetailsForm form={form} isLoading={isLoading} isEdit={isEdit} onChange={handleChange} onSubmit={handleSubmit} />

      {bankDetails && (
        <Card className="border-border/40 rounded-2xl bg-card">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-1.5">
              <History className="h-4 w-4 text-primary" /> Linked Account Summary
            </CardTitle>
            <CardDescription className="text-xs">Your current linked bank account on file.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <p className="text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">Bank</p>
                <p className="font-bold mt-1">{bankDetails.bankName}</p>
              </div>
              <div>
                <p className="text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">Profile ID</p>
                <p className="font-mono font-semibold mt-1 truncate">{bankDetails.hostProfileId}</p>
              </div>
              <div>
                <p className="text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">Last Updated</p>
                <p className="font-bold mt-1">{new Date(bankDetails.updatedAt).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  );
}
