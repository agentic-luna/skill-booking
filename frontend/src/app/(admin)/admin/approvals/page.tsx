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
      <div className="flex justify-between items-center pb-4 border-b">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <CheckSquare className="h-6 w-6 text-primary" /> Program Approvals
          </h1>
          <p className="text-sm text-muted-foreground">Review and approve candidate class programs before they go live on explore feeds.</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchEventQueue}
          className="rounded-xl flex items-center gap-1.5"
          disabled={loading}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 max-w-lg">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search pending programs, trainer, or host..."
            className="pl-9 h-10 rounded-xl bg-card"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="h-10 rounded-xl border border-border/40 bg-card px-3.5 text-xs outline-none focus:ring-1 focus:ring-primary/20 text-muted-foreground font-semibold shrink-0 cursor-pointer"
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
