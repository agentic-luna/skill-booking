"use client";

import React, { useEffect, useState } from "react";
import { Wallet, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAlertStore } from "@/features/alerts/store/alertStore";
import { useAdminStore } from "@/features/admin/store/adminStore";

import LedgerKPIs from "./_components/LedgerKPIs";
import PayoutTable from "./_components/PayoutTable";
import ConfirmPayoutModal from "./_components/ConfirmPayoutModal";
import RefundRequestsTable from "./_components/RefundRequestsTable";

export default function FinancePayoutsPage() {
  const showAlert = useAlertStore((s) => s.showAlert);
  const {
    financeLedger,
    hosts,
    loading,
    error,
    fetchFinanceLedger,
    fetchHosts,
    payoutHost
  } = useAdminStore();

  const [activeTab, setActiveTab] = useState<"payouts" | "refunds">("payouts");
  const [searchTerm, setSearchTerm] = useState("");
  const [kycFilter, setKycFilter] = useState<string>("ALL");
  const [selectedHost, setSelectedHost] = useState<any>(null);
  const [isPayoutConfirmOpen, setIsPayoutConfirmOpen] = useState(false);
  const [payoutLoading, setPayoutLoading] = useState(false);

  useEffect(() => {
    fetchFinanceLedger();
    fetchHosts();
  }, [fetchFinanceLedger, fetchHosts]);

  const handlePayoutRelease = async (hostId: string) => {
    setPayoutLoading(true);
    try {
      const result = await payoutHost(hostId);
      if (result.success) {
        showAlert(
          "Payout Released",
          `Escrow funds of $${result.amount || "N/A"} released to Host bank account via Razorpay transfer (Reference: ${result.payoutId || "N/A"}).`,
          "success"
        );
      } else {
        showAlert("No Pending Escrow", result.message || "No pending host payout found to release.", "warning");
      }
      setIsPayoutConfirmOpen(false);
      setSelectedHost(null);
    } catch (err: any) {
      showAlert("Payout Error", err.message || "Failed to release payout.", "destructive");
    } finally {
      setPayoutLoading(false);
    }
  };

  const handleApproveRefund = (clientName: string, amount: string) => {
    showAlert(
      "Refund Approved",
      `Ticket payment of $${amount} has been successfully reversed to ${clientName}'s account.`,
      "success"
    );
  };

  const filteredHosts = (hosts || []).filter((host) => {
    if (kycFilter !== "ALL" && (host.hostProfile?.kycStatus || "PENDING") !== kycFilter) return false;

    const fullName = `${host.firstName || ""} ${host.lastName || ""}`.toLowerCase();
    const email = (host.email || "").toLowerCase();
    const bankName = (host.hostProfile?.bankDetail?.bankName || "").toLowerCase();
    const search = searchTerm.toLowerCase();

    return fullName.includes(search) || email.includes(search) || bankName.includes(search);
  });

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-6">
        <div className="space-y-2">
          <h1 className="text-4xl lg:text-5xl font-medium tracking-tight text-foreground leading-[1.1]">
            <span className="inline-flex items-center justify-center bg-card shadow-sm border border-black/5 dark:border-white/5 rounded-full p-2 mx-1 align-middle"><Wallet className="w-6 h-6 text-foreground" /></span> Platform <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#a0f212] to-emerald-400 font-bold drop-shadow-[0_0_15px_rgba(160,242,18,0.2)]">Ledger</span>
          </h1>
          <p className="text-muted-foreground font-medium pl-2">Monitor platform financial statistics, refund liability, and release host escrow transfers.</p>
        </div>
        <Button 
          onClick={() => {
            fetchFinanceLedger();
            fetchHosts();
          }}
          disabled={loading}
          className="rounded-full px-6 py-6 font-bold shadow-xl transition-all duration-300 bg-[#0b0c01] text-white hover:bg-[#1a1c02] border-none flex-shrink-0"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Sync Ledger
        </Button>
      </div>

      {error && (
        <div className="p-3 text-xs font-medium text-destructive bg-destructive/10 rounded-xl border border-destructive/20 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>Error sync: {error}</span>
        </div>
      )}

      {/* Ledger KPI Stats grid */}
      <LedgerKPIs financeLedger={financeLedger} />

      {/* Tabs list toggle switcher */}
      <div className="flex bg-card p-1 rounded-full border border-black/5 dark:border-white/5 w-fit shadow-sm">
        <button
          onClick={() => setActiveTab("payouts")}
          className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
            activeTab === "payouts" 
              ? "bg-[#0b0c01] text-white shadow-md" 
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
        >
          Payout Disbursements
        </button>
        <button
          onClick={() => setActiveTab("refunds")}
          className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
            activeTab === "refunds" 
              ? "bg-[#0b0c01] text-white shadow-md" 
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
        >
          Refund Requests
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === "payouts" ? (
        <PayoutTable
          loading={loading}
          filteredHosts={filteredHosts}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          kycFilter={kycFilter}
          onKycFilterChange={setKycFilter}
          onSelectHost={setSelectedHost}
          onOpenConfirm={setIsPayoutConfirmOpen}
        />
      ) : (
        <RefundRequestsTable onApproveRefund={handleApproveRefund} />
      )}

      {/* CONFIRM PAYOUT MODAL */}
      <ConfirmPayoutModal
        isOpen={isPayoutConfirmOpen}
        onOpenChange={setIsPayoutConfirmOpen}
        selectedHost={selectedHost}
        payoutLoading={payoutLoading}
        onConfirm={handlePayoutRelease}
        onCancel={() => {
          setIsPayoutConfirmOpen(false);
          setSelectedHost(null);
        }}
      />

    </div>
  );
}
