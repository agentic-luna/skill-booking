"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Wallet, RefreshCw, AlertCircle, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAlertStore } from "@/features/alerts/store/alertStore";
import { useAdminStore } from "@/features/admin/store/adminStore";

import LedgerKPIs from "./_components/LedgerKPIs";
import PayoutTable from "./_components/PayoutTable";
import ConfirmPayoutModal from "./_components/ConfirmPayoutModal";
import RefundRequestsTable from "./_components/RefundRequestsTable";
import BoostPromotionsTable from "./_components/BoostPromotionsTable";

function AdminFinanceContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const showAlert = useAlertStore((s) => s.showAlert);
  const {
    financeLedger,
    hosts,
    hostsPagination,
    boostRequests,
    boostsPagination,
    loading,
    error,
    fetchFinanceLedger,
    fetchHosts,
    fetchBoostRequests,
    payoutHost,
  } = useAdminStore();

  // Tab state synced with URL query parameter (prevents refresh tab reset)
  const tabParam = searchParams.get("tab");
  const activeTab: "payouts" | "refunds" | "boosts" =
    tabParam === "refunds" ? "refunds" : tabParam === "boosts" ? "boosts" : "payouts";

  const setActiveTab = (tab: "payouts" | "refunds" | "boosts") => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [kycFilter, setKycFilter] = useState<string>("ALL");
  const [selectedHost, setSelectedHost] = useState<any>(null);
  const [isPayoutConfirmOpen, setIsPayoutConfirmOpen] = useState(false);
  const [payoutLoading, setPayoutLoading] = useState(false);

  const syncAllData = () => {
    fetchFinanceLedger();
    fetchHosts();
    fetchBoostRequests();
  };

  useEffect(() => {
    syncAllData();
  }, [fetchFinanceLedger, fetchHosts, fetchBoostRequests]);

  const handlePayoutRelease = async (
    hostId: string,
    mode: "AUTOMATIC" | "MANUAL" = "AUTOMATIC",
    manualRef?: string
  ) => {
    setPayoutLoading(true);
    try {
      const result = await payoutHost(hostId, mode, manualRef);
      if (result.success) {
        const modeLabel = result.mode === "MANUAL" ? "Manual Transfer" : "Razorpay Transfer";
        showAlert(
          "Payout Released",
          `Escrow funds of ₹${result.amount || "N/A"} released to Host bank account via ${modeLabel} (Reference: ${result.payoutId || "N/A"}).`,
          "success"
        );
        setIsPayoutConfirmOpen(false);
        setSelectedHost(null);
      } else {
        showAlert(
          "Payout Unsuccessful",
          result.message || "Razorpay Payout API failed. You can process a Manual Payout instead.",
          "warning"
        );
      }
    } catch (err: any) {
      showAlert("Payout Error", err.message || "Failed to release payout.", "destructive");
    } finally {
      setPayoutLoading(false);
    }
  };

  const handleApproveRefund = (clientName: string, amount: string) => {
    showAlert(
      "Refund Approved",
      `Ticket payment of ₹${amount} has been successfully reversed to ${clientName}'s account.`,
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
          <p className="text-muted-foreground font-medium pl-2">Monitor platform financial statistics, refund liability, boost revenues, and release host escrow transfers.</p>
        </div>
        <Button 
          onClick={syncAllData}
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
      <div className="flex bg-card p-1 rounded-full border border-black/5 dark:border-white/5 w-fit shadow-sm flex-wrap sm:flex-nowrap gap-1">
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
        <button
          onClick={() => setActiveTab("boosts")}
          className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all flex items-center gap-1.5 ${
            activeTab === "boosts" 
              ? "bg-[#0b0c01] text-white shadow-md" 
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
        >
          <Rocket className="h-3.5 w-3.5 text-[#a0f212]" /> Boost Revenue & Hosts
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
          onKycFilterChange={(val) => {
            setKycFilter(val);
            fetchHosts(val, 1, hostsPagination?.limit || 10);
          }}
          onSelectHost={setSelectedHost}
          onOpenConfirm={setIsPayoutConfirmOpen}
          pagination={hostsPagination}
          onPageChange={(page) => fetchHosts(kycFilter, page, hostsPagination?.limit || 10)}
          onLimitChange={(limit) => fetchHosts(kycFilter, 1, limit)}
        />
      ) : activeTab === "refunds" ? (
        <RefundRequestsTable onApproveRefund={handleApproveRefund} />
      ) : (
        <BoostPromotionsTable
          loading={loading}
          boostRequests={boostRequests}
          onRefresh={syncAllData}
          pagination={boostsPagination}
          onPageChange={(page) => fetchBoostRequests(page, boostsPagination?.limit || 10)}
          onLimitChange={(limit) => fetchBoostRequests(1, limit)}
        />
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

export default function FinancePayoutsPage() {
  return (
    <Suspense fallback={
      <div className="py-20 text-center space-y-3">
        <RefreshCw className="h-8 w-8 animate-spin mx-auto text-primary" />
        <p className="text-xs text-muted-foreground font-semibold">Loading platform financial ledger...</p>
      </div>
    }>
      <AdminFinanceContent />
    </Suspense>
  );
}

