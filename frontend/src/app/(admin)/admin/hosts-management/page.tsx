"use client";

import React, { useState, useEffect } from "react";
import { Users, Search, RefreshCw, AlertCircle, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAlertStore } from "@/features/alerts/store/alertStore";
import { useAdminStore } from "@/features/admin/store/adminStore";

import HostCard from "./_components/HostCard";
import NotifyHostModal from "./_components/NotifyHostModal";
import DeleteHostModal from "./_components/DeleteHostModal";

export default function HostManagementPage() {
  const showAlert = useAlertStore((s) => s.showAlert);
  const {
    hosts,
    loading,
    error,
    fetchHosts,
    deleteHost,
    notifyHost
  } = useAdminStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedHost, setSelectedHost] = useState<any>(null);
  const [isNotifyOpen, setIsNotifyOpen] = useState(false);
  const [notifySubject, setNotifySubject] = useState("");
  const [notifyBody, setNotifyBody] = useState("");
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  useEffect(() => {
    fetchHosts();
  }, [fetchHosts]);

  const handleDeleteHost = async (hostId: string) => {
    try {
      await deleteHost(hostId);
      showAlert("Host Removed", "Host registry entry has been successfully deleted/disabled on the platform.", "success");
      setIsDeleteOpen(false);
      setDeleteTargetId(null);
    } catch (err: any) {
      showAlert("Deletion Issue", err.message || "Could not delete this host.", "destructive");
    }
  };

  const handleSendNotification = async () => {
    if (!notifySubject.trim() || !notifyBody.trim()) {
      showAlert("Error", "Subject and message body contents are required to notify.", "destructive");
      return;
    }

    try {
      await notifyHost(selectedHost.id, notifySubject, notifyBody);
      showAlert(
        "Notification Sent",
        `Personal alert email successfully dispatched to ${selectedHost.firstName || ""} ${selectedHost.lastName || ""} (${selectedHost.email}).`,
        "success"
      );
      setIsNotifyOpen(false);
      setNotifySubject("");
      setNotifyBody("");
      setSelectedHost(null);
    } catch (err: any) {
      showAlert("Dispatch Failed", err.message || "Could not send notification to host.", "destructive");
    }
  };

  // Only display real hosts loaded from API
  const activeHosts = hosts || [];

  const filteredHosts = activeHosts.filter((host) => {
    if (statusFilter !== "ALL" && host.status !== statusFilter) return false;

    const fullName = `${host.firstName || ""} ${host.lastName || ""}`.toLowerCase();
    const email = (host.email || "").toLowerCase();
    const bio = (host.hostProfile?.bio || "").toLowerCase();
    const search = searchTerm.toLowerCase();

    return fullName.includes(search) || email.includes(search) || bio.includes(search);
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-6">
        <div className="space-y-2">
          <h1 className="text-4xl lg:text-5xl font-medium tracking-tight text-foreground leading-[1.1]">
            <span className="inline-flex items-center justify-center bg-card shadow-sm border border-black/5 dark:border-white/5 rounded-full p-2 mx-1 align-middle"><Users className="w-6 h-6 text-foreground" /></span> Host <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#a0f212] to-emerald-400 font-bold drop-shadow-[0_0_15px_rgba(160,242,18,0.2)]">Registry</span>
          </h1>
          <p className="text-muted-foreground font-medium pl-2">Manage platform instructors, review KYC applications, and oversee host activities.</p>
        </div>
        <Button 
          onClick={() => fetchHosts()}
          disabled={loading}
          className="rounded-full px-6 py-6 font-bold shadow-xl transition-all duration-300 bg-[#0b0c01] text-white hover:bg-[#1a1c02] border-none flex-shrink-0"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Sync Registry
        </Button>
      </div>

      {/* Filters & Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-card border border-black/5 dark:border-white/5 p-4 rounded-3xl shadow-sm">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search instructors by name, bio, or email..."
            className="pl-11 h-12 rounded-full text-sm bg-muted/30 border-none shadow-inner"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="h-12 w-full sm:w-auto min-w-[150px] rounded-full border-none bg-muted/30 px-4 text-sm outline-none focus:ring-1 focus:ring-[#a0f212]/50 text-foreground font-semibold cursor-pointer shadow-inner"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All Statuses</option>
          <option value="ACTIVE">Active Hosts</option>
          <option value="SUSPENDED">Suspended</option>
        </select>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive flex items-center gap-3 animate-in slide-in-from-top-2">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span className="text-sm font-semibold">{error}</span>
        </div>
      )}

      {/* Hosts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 pb-12">
        {loading ? (
          <div className="col-span-full flex flex-col items-center justify-center py-20 bg-card/50 border border-dashed rounded-3xl">
            <div className="relative">
              <div className="h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
              <Users className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-primary/50" />
            </div>
            <p className="mt-6 text-sm font-medium tracking-widest text-muted-foreground uppercase">Syncing Network...</p>
          </div>
        ) : filteredHosts.length > 0 ? (
          filteredHosts.map((host, index) => (
            <div 
              key={host.id} 
              className="animate-in fade-in slide-in-from-bottom-4" 
              style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
            >
              <HostCard
                host={host}
                onNotifyClick={(h) => {
                  setSelectedHost(h);
                  setIsNotifyOpen(true);
                }}
                onDeleteClick={(id) => {
                  setDeleteTargetId(id);
                  setIsDeleteOpen(true);
                }}
              />
            </div>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-24 bg-card/30 border border-dashed border-border/60 rounded-3xl transition-all hover:bg-card/50">
            <div className="bg-muted p-4 rounded-full mb-4">
              <Search className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <h3 className="text-lg font-bold text-foreground">No instructors found</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm text-center">
              We couldn't find any hosts matching your current search criteria. Try adjusting your filters.
            </p>
            <Button 
              variant="link" 
              onClick={() => { setSearchTerm(""); setStatusFilter("ALL"); }}
              className="mt-4 text-primary"
            >
              Clear filters
            </Button>
          </div>
        )}
      </div>

      {/* NOTIFY PERSONALLY DIALOG */}
      <NotifyHostModal
        isOpen={isNotifyOpen}
        onOpenChange={setIsNotifyOpen}
        selectedHost={selectedHost}
        notifySubject={notifySubject}
        onSubjectChange={setNotifySubject}
        notifyBody={notifyBody}
        onBodyChange={setNotifyBody}
        onSend={handleSendNotification}
        onCancel={() => {
          setIsNotifyOpen(false);
          setSelectedHost(null);
          setNotifySubject("");
          setNotifyBody("");
        }}
      />

      {/* CONFIRM DELETE DIALOG */}
      <DeleteHostModal
        isOpen={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={() => {
          if (deleteTargetId) {
            handleDeleteHost(deleteTargetId);
          }
        }}
        onCancel={() => {
          setIsDeleteOpen(false);
          setDeleteTargetId(null);
        }}
      />

    </div>
  );
}
