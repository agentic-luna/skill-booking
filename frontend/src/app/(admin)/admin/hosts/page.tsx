"use client";

import React, { useState, useEffect } from "react";
import { UserCheck, RefreshCw, Search, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAlertStore } from "@/features/alerts/store/alertStore";
import { useAdminStore } from "@/features/admin/store/adminStore";

import KycTable from "./_components/KycTable";
import KycDetailModal from "./_components/KycDetailModal";
import RejectionReasonModal from "./_components/RejectionReasonModal";

export default function HostVerificationPage() {
  const showAlert = useAlertStore((s) => s.showAlert);
  const {
    hosts,
    hostsPagination,
    pendingKycHosts,
    loading,
    error,
    fetchHosts,
    fetchPendingKycHosts,
    reviewKyc
  } = useAdminStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [accountTypeFilter, setAccountTypeFilter] = useState<string>("ALL");
  const [activeTab, setActiveTab] = useState<"pending" | "all">("pending");
  const [selectedHost, setSelectedHost] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isRejectOpen, setIsRejectOpen] = useState(false);

  useEffect(() => {
    if (activeTab === "pending") {
      fetchPendingKycHosts();
    } else {
      fetchHosts();
    }
  }, [activeTab, fetchPendingKycHosts, fetchHosts]);

  const handleKycDecision = async (hostProfileId: string, decision: "APPROVED" | "REJECTED") => {
    if (decision === "REJECTED" && !rejectionReason.trim()) {
      showAlert("Error", "Rejection reason is required", "destructive");
      return;
    }

    try {
      await reviewKyc(hostProfileId, {
        decision,
        rejectionReason: decision === "REJECTED" ? rejectionReason : undefined
      });
      showAlert(
        decision === "APPROVED" ? "KYC Approved" : "KYC Rejected",
        `Host profile KYC status has been successfully set to: ${decision}`,
        decision === "APPROVED" ? "success" : "destructive"
      );
      setSelectedHost(null);
      setIsRejectOpen(false);
      setRejectionReason("");
    } catch (err: any) {
      showAlert("Error", err.message || "Failed to update KYC status", "destructive");
    }
  };

  const listToFilter = activeTab === "pending" ? pendingKycHosts : hosts;

  const filteredHosts = (listToFilter || []).filter((host) => {
    if (accountTypeFilter !== "ALL" && (host.hostProfile?.accountType || "INDIVIDUAL") !== accountTypeFilter) return false;

    const fullName = `${host.firstName || ""} ${host.lastName || ""}`.toLowerCase();
    const email = (host.email || "").toLowerCase();
    const expertise = (host.hostProfile?.bio || "").toLowerCase();
    const search = searchTerm.toLowerCase();

    return fullName.includes(search) || email.includes(search) || expertise.includes(search);
  });

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-6">
        <div className="space-y-2">
          <h1 className="text-4xl lg:text-5xl font-medium tracking-tight text-foreground leading-[1.1]">
            <span className="inline-flex items-center justify-center bg-card shadow-sm border border-black/5 dark:border-white/5 rounded-full p-2 mx-1 align-middle"><UserCheck className="w-6 h-6 text-foreground" /></span> Host <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#a0f212] to-emerald-400 font-bold drop-shadow-[0_0_15px_rgba(160,242,18,0.2)]">KYC</span>
          </h1>
          <p className="text-muted-foreground font-medium pl-2">Verify and authorize credentials and documents of candidate marketplace instructors.</p>
        </div>
        <Button 
          onClick={() => activeTab === "pending" ? fetchPendingKycHosts() : fetchHosts()}
          disabled={loading}
          className="rounded-full px-6 py-6 font-bold shadow-xl transition-all duration-300 bg-[#0b0c01] text-white hover:bg-[#1a1c02] border-none flex-shrink-0"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Sync KYC
        </Button>
      </div>

      {/* Tabs / Filter and Actions Bar */}
      <div className="flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center bg-card border border-black/5 dark:border-white/5 p-4 rounded-[32px] shadow-sm">
        <div className="flex bg-muted/40 p-1 rounded-full border border-black/5 dark:border-white/5 w-fit shadow-sm">
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
              activeTab === "pending" 
                ? "bg-[#0b0c01] text-white shadow-md" 
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            Pending KYC ({pendingKycHosts?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab("all")}
            className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
              activeTab === "all" 
                ? "bg-[#0b0c01] text-white shadow-md" 
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            All Hosts ({hosts?.length || 0})
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full xl:max-w-md">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search hosts, emails, bios..."
              className="pl-11 h-12 rounded-full text-sm bg-muted/30 border-none shadow-inner"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="h-12 w-full sm:w-auto min-w-[150px] rounded-full border-none bg-muted/30 px-4 text-sm outline-none focus:ring-1 focus:ring-[#a0f212]/50 text-foreground font-semibold shrink-0 cursor-pointer shadow-inner"
            value={accountTypeFilter}
            onChange={(e) => setAccountTypeFilter(e.target.value)}
          >
            <option value="ALL">All Types</option>
            <option value="INDIVIDUAL">Individual</option>
            <option value="COMPANY">Company</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="p-3 text-xs font-medium text-destructive bg-destructive/10 rounded-xl border border-destructive/20 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>Error loading hosts: {error}</span>
        </div>
      )}

      {/* Applications list Table */}
      <KycTable
        activeTab={activeTab}
        pendingCount={pendingKycHosts?.length || 0}
        allCount={hosts?.length || 0}
        loading={loading}
        filteredHosts={filteredHosts}
        onSelectHost={setSelectedHost}
        pagination={activeTab === "all" ? hostsPagination : null}
        onPageChange={(page) => fetchHosts(undefined, page, hostsPagination?.limit || 10)}
        onLimitChange={(limit) => fetchHosts(undefined, 1, limit)}
      />

      {/* KYC REVIEW MODAL */}
      <KycDetailModal
        selectedHost={selectedHost}
        onClose={() => setSelectedHost(null)}
        onApprove={(profileId) => handleKycDecision(profileId, "APPROVED")}
        onRejectTrigger={() => setIsRejectOpen(true)}
      />

      {/* REJECTION REASON DIALOG */}
      <RejectionReasonModal
        isOpen={isRejectOpen}
        onOpenChange={setIsRejectOpen}
        rejectionReason={rejectionReason}
        onReasonChange={setRejectionReason}
        onConfirm={() => {
          if (selectedHost) {
            handleKycDecision(selectedHost.hostProfile.id, "REJECTED");
          }
        }}
        onCancel={() => {
          setIsRejectOpen(false);
          setRejectionReason("");
        }}
      />

    </div>
  );
}
