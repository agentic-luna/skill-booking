"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, CheckCircle2, AlertCircle, Edit, FileText, Globe, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useHostStore } from "@/features/host/store/hostStore";
import { useAuthStore } from "@/features/auth/store/authStore";
import { useAlertStore } from "@/features/alerts/store/alertStore";
import type { KycAccountType } from "@/features/host/api/types";
import KycForm from "./_components/KycForm";

export default function HostKycPage() {
  const router = useRouter();
  const showAlert = useAlertStore((s) => s.showAlert);
  const { user } = useAuthStore();
  const { submitKyc, isLoading, error, clearError } = useHostStore();

  const hostProfile = user?.hostProfile;
  const hasKycSubmitted = !!hostProfile?.govIdUrl;
  const kycStatus = hostProfile?.kycStatus || "PENDING";

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    accountType: "INDIVIDUAL" as KycAccountType,
    govIdUrl: "",
    gstNumber: "",
    bio: "",
  });

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
      showAlert(
        "KYC Saved Successfully",
        "Your verification documents have been updated.",
        "success"
      );
      setIsEditing(false);
    } catch { /* error shown via banner */ }
  };

  if (hasKycSubmitted && !isEditing) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" /> KYC Identity Status
          </h1>
          <p className="text-sm text-muted-foreground">Below are the details and review status of your identity verification.</p>
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
            <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full uppercase border ${
              kycStatus === "APPROVED" 
                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" 
                : "bg-amber-500/10 text-amber-600 border-amber-500/20"
            }`}>
              {kycStatus}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
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

            <div className="flex items-start space-x-3 p-3 rounded-2xl bg-muted/30 border border-border/10 sm:col-span-2">
              <Globe className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <span className="font-bold text-muted-foreground block text-[10px] uppercase tracking-wider">ID Document URL</span>
                <a 
                  href={hostProfile?.govIdUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="font-semibold text-primary hover:underline truncate block"
                >
                  {hostProfile?.govIdUrl}
                </a>
              </div>
            </div>

            {hostProfile?.bio && (
              <div className="flex items-start space-x-3 p-3 rounded-2xl bg-muted/30 border border-border/10 sm:col-span-2">
                <FileText className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold text-muted-foreground block text-[10px] uppercase tracking-wider">Host Bio</span>
                  <span className="font-semibold text-foreground whitespace-pre-wrap">{hostProfile?.bio}</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-3 pt-2">
            <Button 
              onClick={() => setIsEditing(true)} 
              className="flex-1 text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5"
            >
              <Edit className="h-3.5 w-3.5" /> Edit KYC Details
            </Button>
            <Button 
              variant="outline" 
              onClick={() => router.push("/host/dashboard")}
              className="flex-1 text-xs font-bold py-2.5 rounded-xl"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-primary" /> {hasKycSubmitted ? "Edit KYC Verification" : "KYC Verification"}
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
        onCancel={() => {
          if (hasKycSubmitted) {
            setIsEditing(false);
          } else {
            router.push("/host/dashboard");
          }
        }}
      />
    </div>
  );
}
