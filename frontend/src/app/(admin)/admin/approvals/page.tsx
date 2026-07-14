"use client";

import React, { useState, useEffect } from "react";
import { CheckSquare, Search, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAlertStore } from "@/features/alerts/store/alertStore";
import { useAdminStore } from "@/features/admin/store/adminStore";

import ApprovalsGrid from "./_components/ApprovalsGrid";
import ProgramDetailModal from "./_components/ProgramDetailModal";
import LockCommissionModal from "./_components/LockCommissionModal";

export default function AdminApprovalsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProgram, setSelectedProgram] = useState<any | null>(null);
  const [modeFilter, setModeFilter] = useState<string>("ALL");
  
  // Commission settings dialog state
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [approveTargetId, setApproveTargetId] = useState<string | null>(null);
  const [commissionType, setCommissionType] = useState<"PERCENTAGE" | "FIXED">("PERCENTAGE");
  const [platformValue, setPlatformValue] = useState<string>("10");

  const showAlert = useAlertStore((s) => s.showAlert);
  const {
    eventQueue,
    loading,
    error,
    fetchEventQueue,
    approveEvent,
    declineEvent
  } = useAdminStore();

  useEffect(() => {
    fetchEventQueue();
  }, [fetchEventQueue]);

  const handleOpenApproveDialog = (eventId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setApproveTargetId(eventId);
    setIsApproveOpen(true);
  };

  const handleApproveConfirm = async () => {
    if (!approveTargetId) return;
    
    const val = parseFloat(platformValue);
    if (isNaN(val) || val < 0) {
      showAlert("Invalid Commission", "Please enter a valid non-negative platform value.", "destructive");
      return;
    }

    try {
      await approveEvent(approveTargetId, {
        commissionType,
        platformValue: val
      });
      showAlert(
        "Listing Approved",
        `Workshop listing status has been successfully set to: APPROVED with ${commissionType === "PERCENTAGE" ? platformValue + "%" : platformValue} commission.`,
        "success"
      );
      setIsApproveOpen(false);
      setApproveTargetId(null);
      if (selectedProgram?.id === approveTargetId) {
        setSelectedProgram(null);
      }
    } catch (err: any) {
      showAlert("Error approving", err.message || "Failed to approve listing", "destructive");
    }
  };

  const handleDeclineLocal = async (eventId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await declineEvent(eventId);
      showAlert(
        "Listing Declined",
        "The pending program listing has been successfully declined.",
        "success"
      );
      if (selectedProgram?.id === eventId) {
        setSelectedProgram(null);
      }
    } catch (err: any) {
      showAlert("Decline Failed", err.message || "Could not decline listing.", "destructive");
    }
  };

  const filteredApprovals = (eventQueue || []).filter((prog) => {
    if (modeFilter !== "ALL" && prog.mode !== modeFilter) return false;

    const title = (prog.title || "").toLowerCase();
    const trainer = (prog.trainerName || "").toLowerCase();
    const hostName = `${prog.host?.user?.firstName || ""} ${prog.host?.user?.lastName || ""}`.toLowerCase();
    const search = searchTerm.toLowerCase();

    return title.includes(search) || trainer.includes(search) || hostName.includes(search);
  });

  const getVenueDetailsString = (venueDetails: any) => {
    if (!venueDetails) return "Online Zoom link";
    if (typeof venueDetails === "string") return venueDetails;
    if (typeof venueDetails === "object") {
      return venueDetails.address || venueDetails.meetingLink || venueDetails.venueName || JSON.stringify(venueDetails);
    }
    return "Online/Offline venue details";
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-6">
        <div className="space-y-2">
          <h1 className="text-4xl lg:text-5xl font-medium tracking-tight text-foreground leading-[1.1]">
            <span className="inline-flex items-center justify-center bg-card shadow-sm border border-black/5 dark:border-white/5 rounded-full p-2 mx-1 align-middle"><CheckSquare className="w-6 h-6 text-foreground" /></span> Program <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#a0f212] to-emerald-400 font-bold drop-shadow-[0_0_15px_rgba(160,242,18,0.2)]">Approvals</span>
          </h1>
          <p className="text-muted-foreground font-medium pl-2">Review and approve candidate class programs before they go live on explore feeds.</p>
        </div>
        <Button 
          onClick={fetchEventQueue}
          disabled={loading}
          className="rounded-full px-6 py-6 font-bold shadow-xl transition-all duration-300 bg-[#0b0c01] text-white hover:bg-[#1a1c02] border-none flex-shrink-0"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Sync Queue
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-card border border-black/5 dark:border-white/5 p-4 rounded-3xl shadow-sm">
        <div className="flex-1 relative w-full">
          <Search className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search pending programs, trainer, or host..."
            className="pl-11 h-12 rounded-full text-sm bg-muted/30 border-none shadow-inner"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="h-12 w-full sm:w-auto min-w-[150px] rounded-full border-none bg-muted/30 px-4 text-sm outline-none focus:ring-1 focus:ring-[#a0f212]/50 text-foreground font-semibold shrink-0 cursor-pointer shadow-inner"
          value={modeFilter}
          onChange={(e) => setModeFilter(e.target.value)}
        >
          <option value="ALL">All Modes</option>
          <option value="ONLINE">Online Mode</option>
          <option value="OFFLINE">Offline Mode</option>
        </select>
      </div>

      {error && (
        <div className="p-3 text-xs font-medium text-destructive bg-destructive/10 rounded-xl border border-destructive/20 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>Error loading queue: {error}</span>
        </div>
      )}

      {/* Approvals list */}
      <ApprovalsGrid
        loading={loading}
        filteredApprovals={filteredApprovals}
        onSelectProgram={setSelectedProgram}
        onDecline={handleDeclineLocal}
        onApproveTrigger={handleOpenApproveDialog}
        getVenueDetailsString={getVenueDetailsString}
      />

      {/* FULL PROGRAM DETAIL DIALOG MODAL */}
      <ProgramDetailModal
        selectedProgram={selectedProgram}
        onClose={() => setSelectedProgram(null)}
        onDecline={handleDeclineLocal}
        onApprove={handleOpenApproveDialog}
        getVenueDetailsString={getVenueDetailsString}
      />

      {/* CHOOSE COMMISSION & DEPLOY MODAL */}
      <LockCommissionModal
        isOpen={isApproveOpen}
        onOpenChange={setIsApproveOpen}
        commissionType={commissionType}
        onCommissionTypeChange={setCommissionType}
        platformValue={platformValue}
        onPlatformValueChange={setPlatformValue}
        onConfirm={handleApproveConfirm}
        onCancel={() => {
          setIsApproveOpen(false);
          setApproveTargetId(null);
        }}
      />

    </div>
  );
}
