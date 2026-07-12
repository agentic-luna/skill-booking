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
      <div className="flex justify-between items-center pb-4 border-b">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <UserCheck className="h-6 w-6 text-primary" /> Host KYC Verification
          </h1>
          <p className="text-sm text-muted-foreground">Verify and authorize credentials and documents of candidate marketplace instructors.</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => activeTab === "pending" ? fetchPendingKycHosts() : fetchHosts()}
          className="rounded-xl flex items-center gap-1.5"
          disabled={loading}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Tabs / Filter and Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex bg-muted/40 p-1 rounded-xl border border-border/20">
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "pending" 
                ? "bg-card text-foreground shadow-xs border border-border/20" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Pending KYC ({pendingKycHosts?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "all" 
                ? "bg-card text-foreground shadow-xs border border-border/20" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All Hosts ({hosts?.length || 0})
          </button>
        </div>

        <div className="flex flex-row gap-3 w-full sm:max-w-md">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search hosts, emails, bios..."
              className="pl-9 h-9 rounded-xl text-xs bg-card"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="h-9 rounded-xl border border-border/40 bg-card px-3 text-xs outline-none focus:ring-1 focus:ring-primary/20 text-muted-foreground font-semibold shrink-0 cursor-pointer"
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
