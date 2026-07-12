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
      <div className="flex justify-between items-center pb-4 border-b">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <Wallet className="h-6 w-6 text-primary" /> Finance & Payouts Ledger
          </h1>
          <p className="text-sm text-muted-foreground">Monitor platform financial statistics, refund liability, and release host escrow transfers.</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => {
            fetchFinanceLedger();
            fetchHosts();
          }}
          className="rounded-xl flex items-center gap-1.5"
          disabled={loading}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh Stats
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
      <div className="flex bg-muted/40 p-1 rounded-xl border border-border/20 w-fit">
        <button
          onClick={() => setActiveTab("payouts")}
          className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === "payouts" 
              ? "bg-card text-foreground shadow-xs border border-border/20" 
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Payout Disbursements
        </button>
        <button
          onClick={() => setActiveTab("refunds")}
          className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === "refunds" 
              ? "bg-card text-foreground shadow-xs border border-border/20" 
              : "text-muted-foreground hover:text-foreground"
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
