"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, CheckCircle2, AlertCircle, Edit, FileText, Globe, User, IndianRupee, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useHostStore } from "@/features/host/store/hostStore";
import { useAuthStore } from "@/features/auth/store/authStore";
import { useAlertStore } from "@/features/alerts/store/alertStore";
import type { KycAccountType, BankDetailsPayload } from "@/features/host/api/types";
import KycForm from "./_components/KycForm";
import BankDetailsForm from "./_components/BankDetailsForm";

const EMPTY_BANK_FORM: BankDetailsPayload = {
  accountHolderName: "", accountNumber: "", ifscCode: "", bankName: "", upiId: "",
};

export default function HostKycPage() {
  const router = useRouter();
  const showAlert = useAlertStore((s) => s.showAlert);
  const { user } = useAuthStore();
  const { submitKyc, bankDetails, fetchBankDetails, submitBankDetails, updateBankDetails, requestKycUnlock, isLoading, error, clearError } = useHostStore();

  const hostProfile = user?.hostProfile;
  const hasKycSubmitted = !!hostProfile?.govIdUrl;
  const hasBankSubmitted = !!bankDetails;
  const kycStatus = hostProfile?.kycStatus || "PENDING";

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    accountType: "INDIVIDUAL" as KycAccountType,
    govIdUrl: "",
    gstNumber: "",
    bio: "",
  });

  const [bankForm, setBankForm] = useState<BankDetailsPayload>(EMPTY_BANK_FORM);

  useEffect(() => {
    fetchBankDetails();
  }, [fetchBankDetails]);

  useEffect(() => {
    if (hostProfile) {
      setForm({
        accountType: (hostProfile.accountType as KycAccountType) || "INDIVIDUAL",
        govIdUrl: hostProfile.govIdUrl || "",
        gstNumber: hostProfile.gstNumber || "",
        bio: hostProfile.bio || "",
      });
    }
  }, [hostProfile]);

  useEffect(() => {
    if (bankDetails) {
      setBankForm({
        accountHolderName: bankDetails.accountHolderName || "",
        accountNumber: bankDetails.accountNumber || "",
        ifscCode: bankDetails.ifscCode || "",
        bankName: bankDetails.bankName || "",
        upiId: bankDetails.upiId || "",
      });
    }
  }, [bankDetails]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleBankChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setBankForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

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

      if (hasBankSubmitted) {
        await updateBankDetails(bankForm);
      } else {
        await submitBankDetails(bankForm);
      }

      showAlert(
        "Details Saved",
        "Your KYC and Bank details have been securely submitted.",
        "success"
      );
      setIsEditing(false);
    } catch { /* error shown via banner */ }
  };

  const handleRequestUnlock = async () => {
    try {
      await requestKycUnlock();
      showAlert("Unlock Requested", "Your request to edit KYC details has been sent to the superadmin.", "success");
    } catch (e: any) {
      // Error handled by store/banner
    }
  };

  if (hasKycSubmitted && hasBankSubmitted && !isEditing) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" /> Identity & Bank Status
          </h1>
          <p className="text-sm text-muted-foreground">Below are the details and review status of your identity and bank verification.</p>
        </div>

        <div className="bg-card border border-border/40 p-6 rounded-3xl shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <div className="flex items-center space-x-3">
              {kycStatus === "APPROVED" ? (
                <div className="p-2 rounded-full bg-emerald-500/10 text-emerald-600">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
              ) : (
                <div className="p-2 rounded-full bg-amber-500/10 text-amber-600 animate-pulse">
                  <AlertCircle className="h-5 w-5" />
                </div>
              )}
              <div>
                <h3 className="font-bold text-sm text-foreground">Review Status</h3>
                <p className="text-[10px] text-muted-foreground">Verification status of your submission</p>
              </div>
            </div>
            <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full uppercase border ${kycStatus === "APPROVED"
                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                : "bg-amber-500/10 text-amber-600 border-amber-500/20"
              }`}>
              {kycStatus}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider border-b pb-2">KYC Details</h3>
              <div className="grid grid-cols-1 gap-4 text-xs">
                <div className="flex items-start space-x-3 p-3 rounded-2xl bg-muted/30 border border-border/10">
                  <User className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <div>
                    <span className="font-bold text-muted-foreground block text-[10px] uppercase tracking-wider">Account Type</span>
                    <span className="font-semibold text-foreground">{hostProfile?.accountType}</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 rounded-2xl bg-muted/30 border border-border/10">
                  <FileText className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <div>
                    <span className="font-bold text-muted-foreground block text-[10px] uppercase tracking-wider">GST Number</span>
                    <span className="font-semibold text-foreground">{hostProfile?.gstNumber || "N/A"}</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 rounded-2xl bg-muted/30 border border-border/10">
                  <Globe className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-muted-foreground block text-[10px] uppercase tracking-wider">ID Document URL</span>
                    <a
                      href={hostProfile?.govIdUrl || ""}
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-primary hover:underline truncate block"
                    >
                      {hostProfile?.govIdUrl}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider border-b pb-2">Bank Details</h3>
              <div className="grid grid-cols-1 gap-4 text-xs">
                 <div className="flex items-start space-x-3 p-3 rounded-2xl bg-muted/30 border border-border/10">
                  <User className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <div>
                    <span className="font-bold text-muted-foreground block text-[10px] uppercase tracking-wider">Account Holder</span>
                    <span className="font-semibold text-foreground">{bankDetails?.accountHolderName}</span>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 rounded-2xl bg-muted/30 border border-border/10">
                  <IndianRupee className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <div>
                    <span className="font-bold text-muted-foreground block text-[10px] uppercase tracking-wider">Bank Name</span>
                    <span className="font-semibold text-foreground">{bankDetails?.bankName}</span>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 rounded-2xl bg-muted/30 border border-border/10">
                  <FileText className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <div>
                    <span className="font-bold text-muted-foreground block text-[10px] uppercase tracking-wider">IFSC / Routing</span>
                    <span className="font-semibold text-foreground">{bankDetails?.ifscCode}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {kycStatus === "APPROVED" ? (
             hostProfile?.kycUnlockRequested ? (
               <div className="bg-blue-500/10 border border-blue-500/20 text-blue-700 p-4 rounded-xl text-xs flex items-start gap-3">
                 <Lock className="w-5 h-5 shrink-0 mt-0.5" />
                 <p className="font-semibold leading-relaxed">
                   Unlock Requested. Waiting for admin approval.
                 </p>
               </div>
             ) : (
               <div className="bg-amber-500/10 border border-amber-500/20 text-amber-700 p-4 rounded-xl text-xs flex items-start gap-3">
                 <Lock className="w-5 h-5 shrink-0 mt-0.5" />
                 <div className="flex-1">
                   <p className="font-semibold leading-relaxed">
                     Your verification has been fully approved and locked for security. To update your bank or identity details, please request edit access.
                   </p>
                   <Button
                     onClick={handleRequestUnlock}
                     disabled={isLoading}
                     variant="outline"
                     className="mt-3 text-xs font-bold py-1.5 h-8 rounded-lg bg-white/50 hover:bg-white"
                   >
                     {isLoading ? "Requesting..." : "Request Edit Access"}
                   </Button>
                 </div>
               </div>
             )
          ) : (
            <div className="flex items-center space-x-3 pt-2">
              <Button
                onClick={() => setIsEditing(true)}
                className="flex-1 text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5"
              >
                <Edit className="h-3.5 w-3.5" /> Edit KYC & Bank Details
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/host/dashboard")}
                className="flex-1 text-xs font-bold py-2.5 rounded-xl"
              >
                Back to Dashboard
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-primary" /> {hasKycSubmitted && hasBankSubmitted ? "Edit Verification Details" : "Identity & Bank Setup"}
        </h1>
        <p className="text-sm text-muted-foreground">Submit your identity documents and payout bank account details to unlock host capabilities on the platform.</p>
      </div>

      {error && (
        <div className="p-3 text-xs font-medium text-destructive bg-destructive/10 rounded-lg border border-destructive/20">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-lg font-bold text-foreground mb-4">1. Identity Verification</h2>
            <div className="bg-card border border-border/40 p-6 rounded-3xl shadow-sm">
               <KycForm form={form} isLoading={isLoading} onChange={handleChange} onSubmit={(e) => { e.preventDefault(); }} onCancel={() => {}} hideButtons />
            </div>
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground mb-4">2. Payout Bank Details</h2>
            <div className="bg-card border border-border/40 p-6 rounded-3xl shadow-sm">
               <BankDetailsForm form={bankForm} isLoading={isLoading} isEdit={hasBankSubmitted} onChange={handleBankChange} onSubmit={(e) => { e.preventDefault(); }} hideButtons />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-4 border-t">
          <Button type="submit" disabled={isLoading} className="flex-1 font-bold text-xs h-10 rounded-xl">
             {hasKycSubmitted && hasBankSubmitted ? "Update Details" : "Submit Details"}
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => {
              if (hasKycSubmitted && hasBankSubmitted) {
                setIsEditing(false);
              } else {
                router.push("/host/dashboard");
              }
            }} 
            className="flex-1 font-bold text-xs h-10 rounded-xl"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
