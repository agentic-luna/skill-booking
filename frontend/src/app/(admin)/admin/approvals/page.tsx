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
  const [activeTab, setActiveTab] = useState<"listings" | "edits">("listings");
  
  // Commission settings dialog state
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [approveTargetId, setApproveTargetId] = useState<string | null>(null);
  const [commissionType, setCommissionType] = useState<"PERCENTAGE" | "FIXED">("PERCENTAGE");
  const [platformValue, setPlatformValue] = useState<string>("10");

  // Edit request confirm dialog state
  type EditConfirmAction = { type: "reject" | "approve"; id: string; title: string } | null;
  const [editConfirm, setEditConfirm] = useState<EditConfirmAction>(null);
  const [editActionLoading, setEditActionLoading] = useState(false);

  const showAlert = useAlertStore((s) => s.showAlert);
  const {
    eventQueue,
    editRequests,
    loading,
    error,
    fetchEventQueue,
    fetchEditRequests,
    approveEvent,
    declineEvent,
    approveEditRequest,
    rejectEditRequest
  } = useAdminStore();

  useEffect(() => {
    fetchEventQueue();
    fetchEditRequests();
  }, [fetchEventQueue, fetchEditRequests]);

  const handleOpenApproveDialog = (eventId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setApproveTargetId(eventId);
    setIsApproveOpen(true);
  };

  const handleApproveConfirm = async () => {
    if (!approveTargetId) return;

    try {
      const result = await approveEvent(approveTargetId, {});
      const appliedType = result.commission?.commissionType;
      const appliedVal = result.commission?.platformValue;

      showAlert(
        "Listing Approved",
        `Workshop listing status has been successfully set to: APPROVED with ${appliedType === "PERCENTAGE" ? appliedVal + "%" : appliedVal} commission.`,
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

  const handleEditConfirm = async () => {
    if (!editConfirm) return;
    setEditActionLoading(true);
    try {
      if (editConfirm.type === "reject") {
        await rejectEditRequest(editConfirm.id);
        showAlert("Rejected", "Edit request rejected.", "success");
      } else {
        await approveEditRequest(editConfirm.id);
        showAlert("Approved", "Event is now unlocked for edits.", "success");
      }
    } catch (err: any) {
      showAlert("Error", err.message || "Action failed.", "destructive");
    } finally {
      setEditActionLoading(false);
      setEditConfirm(null);
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

      {/* Approvals & Edit Requests Tabs */}
      <div className="flex items-center gap-4 border-b border-black/5 dark:border-white/5 pb-2">
        <button
          className={`pb-2 px-2 text-sm font-bold border-b-2 transition-colors ${
            activeTab === "listings"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("listings")}
        >
          New Listings ({filteredApprovals.length})
        </button>
        <button
          className={`pb-2 px-2 text-sm font-bold border-b-2 transition-colors ${
            activeTab === "edits"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("edits")}
        >
          Edit Requests ({editRequests?.length || 0})
        </button>
      </div>

      {/* Approvals list */}
      {activeTab === "listings" ? (
        <ApprovalsGrid
          loading={loading}
          filteredApprovals={filteredApprovals}
          onSelectProgram={setSelectedProgram}
          onDecline={handleDeclineLocal}
          onApproveTrigger={handleOpenApproveDialog}
          getVenueDetailsString={getVenueDetailsString}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {editRequests?.length === 0 ? (
            <div className="col-span-full py-12 text-center text-muted-foreground bg-card rounded-[32px] border border-black/5">
              No pending edit requests.
            </div>
          ) : (
            editRequests?.map((req: any) => (
              <div key={req.id} className="bg-card border border-black/5 rounded-[32px] p-6 shadow-sm flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg text-foreground line-clamp-1">{req.event?.title}</h3>
                    <p className="text-sm text-muted-foreground">{req.host?.user?.firstName} {req.host?.user?.lastName}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-amber-500/10 text-amber-600">Pending</span>
                </div>
                
                <div className="bg-muted/30 p-3 rounded-xl border border-black/5">
                  <p className="text-xs font-semibold text-muted-foreground mb-1">Reason for edit:</p>
                  <p className="text-sm font-medium text-foreground">{req.reason || "No reason provided."}</p>
                </div>

                <div className="flex gap-2 mt-auto pt-2">
                  <Button
                    variant="outline"
                    className="flex-1 rounded-xl text-xs font-bold border-destructive/20 text-destructive hover:bg-destructive/10"
                    onClick={() => setEditConfirm({ type: "reject", id: req.id, title: req.event?.title || "this event" })}
                  >
                    Reject
                  </Button>
                  <Button
                    className="flex-1 rounded-xl text-xs font-bold bg-[#0b0c01] text-white hover:bg-black/80"
                    onClick={() => setEditConfirm({ type: "approve", id: req.id, title: req.event?.title || "this event" })}
                  >
                    Unlock Event
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

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
        onConfirm={handleApproveConfirm}
        onCancel={() => {
          setIsApproveOpen(false);
          setApproveTargetId(null);
        }}
      />

      {/* EDIT REQUEST CONFIRM DIALOG */}
      {editConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => !editActionLoading && setEditConfirm(null)}
          />
          {/* Dialog Panel */}
          <div className="relative z-10 bg-card border border-black/10 dark:border-white/10 rounded-[28px] shadow-2xl p-7 w-full max-w-sm mx-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex flex-col gap-4">
              {/* Icon + Title */}
              <div className="flex items-center gap-3">
                <span className={`p-2.5 rounded-xl ${editConfirm.type === "reject" ? "bg-destructive/10" : "bg-[#a0f212]/10"}`}>
                  {editConfirm.type === "reject" ? (
                    <AlertCircle className="h-5 w-5 text-destructive" />
                  ) : (
                    <CheckSquare className="h-5 w-5 text-[#a0f212]" />
                  )}
                </span>
                <div>
                  <p className="font-bold text-sm text-foreground">
                    {editConfirm.type === "reject" ? "Reject Edit Request?" : "Unlock Event for Edits?"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{editConfirm.title}</p>
                </div>
              </div>

              {/* Body */}
              <p className="text-xs text-muted-foreground leading-relaxed">
                {editConfirm.type === "reject"
                  ? "The edit request will be marked as rejected. The host will not be allowed to make changes to this event."
                  : "The event will be unlocked and its status moved back to Pending so the host can make edits. It will need re-approval before going live."}
              </p>

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl text-xs font-bold h-10"
                  onClick={() => setEditConfirm(null)}
                  disabled={editActionLoading}
                >
                  Cancel
                </Button>
                <Button
                  className={`flex-1 rounded-xl text-xs font-bold h-10 ${
                    editConfirm.type === "reject"
                      ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      : "bg-[#0b0c01] text-white hover:bg-[#1a1c02]"
                  }`}
                  onClick={handleEditConfirm}
                  disabled={editActionLoading}
                >
                  {editActionLoading ? (
                    <span className="flex items-center gap-1.5">
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      {editConfirm.type === "reject" ? "Rejecting..." : "Unlocking..."}
                    </span>
                  ) : editConfirm.type === "reject" ? "Yes, Reject" : "Yes, Unlock"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
