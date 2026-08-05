"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { RefreshCw, Wallet, ShieldAlert, FileSpreadsheet, ArrowUpRight, ArrowDownLeft, Zap, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminStore } from "@/features/admin/store/adminStore";
import { useAlertStore } from "@/features/alerts/store/alertStore";

import PayoutTable from "./_components/PayoutTable";
import RefundRequestsTable from "./_components/RefundRequestsTable";
import BoostPromotionsTable from "./_components/BoostPromotionsTable";
import ConfirmPayoutModal from "./_components/ConfirmPayoutModal";

function AdminFinanceContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const showAlert = useAlertStore((s) => s.showAlert);
  const {
    financeLedger,
    eventPayouts,
    eventPayoutsPagination,
    boostRequests,
    boostsPagination,
    loading,
    error,
    fetchFinanceLedger,
    fetchEventPayouts,
    payoutEvent,
    fetchBoostRequests,
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
  const [eventStatusFilter, setEventStatusFilter] = useState<string>("ALL");
  const [payoutStatusFilter, setPayoutStatusFilter] = useState<string>("ALL");
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isPayoutConfirmOpen, setIsPayoutConfirmOpen] = useState(false);
  const [payoutLoading, setPayoutLoading] = useState(false);

  const syncAllData = () => {
    fetchFinanceLedger();
    fetchEventPayouts({ page: 1, limit: 10, payoutStatus: payoutStatusFilter, eventStatus: eventStatusFilter, search: searchTerm });
    fetchBoostRequests();
  };

  useEffect(() => {
    fetchFinanceLedger();
    fetchEventPayouts({ page: 1, limit: 10, payoutStatus: payoutStatusFilter, eventStatus: eventStatusFilter, search: searchTerm });
    fetchBoostRequests();
  }, [fetchFinanceLedger, fetchEventPayouts, fetchBoostRequests, payoutStatusFilter, eventStatusFilter, searchTerm]);

  const handleEventPayoutRelease = async (
    eventId: string,
    mode: "AUTOMATIC" | "MANUAL" = "MANUAL",
    manualRef?: string
  ) => {
    setPayoutLoading(true);
    try {
      const result = await payoutEvent(eventId, mode, manualRef);
      if (result.success) {
        const modeLabel = result.mode === "MANUAL" ? "Manual Transfer" : "Razorpay Transfer";
        showAlert(
          "Event Payout Released",
          `Escrow funds of ₹${result.amount || "N/A"} released to Host bank account for workshop "${result.eventTitle || ""}" via ${modeLabel} (Reference: ${result.payoutId || "N/A"}).`,
          "success"
        );
        setIsPayoutConfirmOpen(false);
        setSelectedEvent(null);
      } else {
        showAlert(
          "Payout Unsuccessful",
          result.message || "Could not disburse escrow funds for this event.",
          "warning"
        );
      }
    } catch (err: any) {
      showAlert("Payout Error", err.message || "Failed to disburse escrow funds for event", "destructive");
    } finally {
      setPayoutLoading(false);
    }
  };

  const handleApproveRefund = (clientName: string, amount: string) => {
    showAlert("Refund Triggered", `Initiated refund of ${amount} INR for client ${clientName}.`, "success");
    syncAllData();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-4">
        <div className="space-y-2">
          <h1 className="text-4xl lg:text-5xl font-medium tracking-tight text-foreground leading-[1.1]">
            <span className="inline-flex items-center justify-center bg-card shadow-sm border border-black/5 dark:border-white/5 rounded-full p-2 mx-1 align-middle"><Wallet className="w-6 h-6 text-foreground" /></span> Platform <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#a0f212] to-emerald-400 font-bold drop-shadow-[0_0_15px_rgba(160,242,18,0.2)]">Finance</span>
          </h1>
          <p className="text-muted-foreground font-medium pl-2">Escrow disbursement ledger per workshop event, client refund demands, and boost revenue metrics.</p>
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
          <ShieldAlert className="h-4 w-4 shrink-0" />
          <span>Error loading ledger metrics: {error}</span>
        </div>
      )}

      {/* Top Financial Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-card border border-black/5 dark:border-white/5 p-5 rounded-3xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Escrow Held Liability</span>
            <div className="bg-amber-500/10 p-2 rounded-xl text-amber-500">
              <ArrowDownLeft className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl lg:text-3xl font-black text-foreground font-mono">
              ₹{Number(financeLedger?.totalEscrowLiabilities ?? financeLedger?.totalEscrowLiability ?? 0).toLocaleString()} <span className="text-xs text-muted-foreground font-normal">INR</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Pending escrow held for upcoming & completed events</p>
          </div>
        </div>

        <div className="bg-card border border-black/5 dark:border-white/5 p-5 rounded-3xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Net Platform Revenue</span>
            <div className="bg-[#a0f212]/10 p-2 rounded-xl text-[#a0f212]">
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl lg:text-3xl font-black text-foreground font-mono">
              ₹{Number(financeLedger?.totalRealizedRevenue ?? financeLedger?.totalPlatformNetRevenue ?? 0).toLocaleString()} <span className="text-xs text-muted-foreground font-normal">INR</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Total platform commission earnings captured</p>
          </div>
        </div>

        <div className="bg-card border border-black/5 dark:border-white/5 p-5 rounded-3xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Gross GMV Processed</span>
            <div className="bg-blue-500/10 p-2 rounded-xl text-blue-500">
              <FileSpreadsheet className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl lg:text-3xl font-black text-foreground font-mono">
              ₹{Number(financeLedger?.totalGrossVolume ?? ((financeLedger?.totalEscrowLiabilities ?? 0) + (financeLedger?.totalRealizedRevenue ?? 0))).toLocaleString()} <span className="text-xs text-muted-foreground font-normal">INR</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Gross marketplace booking transactions volume</p>
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex bg-muted/40 p-1.5 rounded-full border border-black/5 dark:border-white/5 w-fit shadow-sm">
        <button
          onClick={() => setActiveTab("payouts")}
          className={`px-6 py-2.5 rounded-full text-xs font-extrabold transition-all flex items-center gap-2 ${
            activeTab === "payouts"
              ? "bg-[#0b0c01] text-white shadow-md"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
        >
          <Wallet className="h-3.5 w-3.5" /> Workshop Event Payouts
        </button>

        <button
          onClick={() => setActiveTab("refunds")}
          className={`px-6 py-2.5 rounded-full text-xs font-extrabold transition-all flex items-center gap-2 ${
            activeTab === "refunds"
              ? "bg-[#0b0c01] text-white shadow-md"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
        >
          <ArrowDownLeft className="h-3.5 w-3.5 text-amber-500" /> Ticket Refund Demands
        </button>

        <button
          onClick={() => setActiveTab("boosts")}
          className={`px-6 py-2.5 rounded-full text-xs font-extrabold transition-all flex items-center gap-2 ${
            activeTab === "boosts"
              ? "bg-[#0b0c01] text-white shadow-md"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
        >
          <Zap className="h-3.5 w-3.5 text-[#a0f212]" /> Host Boost Promotions ({boostRequests?.length || 0})
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === "payouts" ? (
        <PayoutTable
          loading={loading}
          eventPayouts={eventPayouts}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          eventStatusFilter={eventStatusFilter}
          onEventStatusFilterChange={setEventStatusFilter}
          payoutStatusFilter={payoutStatusFilter}
          onPayoutStatusFilterChange={setPayoutStatusFilter}
          onSelectEvent={setSelectedEvent}
          onOpenConfirm={setIsPayoutConfirmOpen}
          pagination={eventPayoutsPagination}
          onPageChange={(page) => fetchEventPayouts({ page, limit: eventPayoutsPagination?.limit || 10, payoutStatus: payoutStatusFilter, eventStatus: eventStatusFilter, search: searchTerm })}
          onLimitChange={(limit) => fetchEventPayouts({ page: 1, limit, payoutStatus: payoutStatusFilter, eventStatus: eventStatusFilter, search: searchTerm })}
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
        selectedEvent={selectedEvent}
        payoutLoading={payoutLoading}
        onConfirm={handleEventPayoutRelease}
        onCancel={() => {
          setIsPayoutConfirmOpen(false);
          setSelectedEvent(null);
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
