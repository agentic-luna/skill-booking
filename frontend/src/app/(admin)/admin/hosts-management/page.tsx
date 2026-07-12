"use client";

import React, { useState, useEffect } from "react";
import { Users, Search, RefreshCw, AlertCircle } from "lucide-react";
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
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex justify-between items-center pb-4 border-b">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" /> Host Management Registry
          </h1>
          <p className="text-sm text-muted-foreground">Manage and overview active platform hosts. Perform account removal or notify hosts personally.</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => fetchHosts()}
          className="rounded-xl flex items-center gap-1.5"
          disabled={loading}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Filter and Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-3 max-w-lg">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search hosts, bios, emails..."
            className="pl-9 h-9 rounded-xl text-xs bg-muted/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="h-9 rounded-xl border border-border/40 bg-card px-3 text-xs outline-none focus:ring-1 focus:ring-primary/20 text-muted-foreground font-semibold shrink-0 cursor-pointer"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="SUSPENDED">Suspended</option>
        </select>
      </div>

      {error && (
        <div className="p-3 text-xs font-medium text-destructive bg-destructive/10 rounded-xl border border-destructive/20 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>Error loading: {error}</span>
        </div>
      )}

      {/* Hosts Roster List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-2 text-center p-12 bg-card border rounded-2xl">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
            <span>Fetching hosts registry logs...</span>
          </div>
        ) : filteredHosts.length > 0 ? (
          filteredHosts.map((host) => (
            <HostCard
              key={host.id}
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
          ))
        ) : (
          <div className="col-span-2 text-center p-12 bg-card border rounded-2xl border-dashed border-border/60 text-muted-foreground text-xs">
            No hosts found matching your search.
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
