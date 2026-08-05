"use client";

import React, { useState, useEffect } from "react";
import { Users, Search, RefreshCw, AlertCircle, ShieldCheck, Mail, Trash2, Landmark, QrCode, Copy, Check, UserCheck, Clock, XCircle, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAlertStore } from "@/features/alerts/store/alertStore";
import { useAdminStore } from "@/features/admin/store/adminStore";
import { PaginationControl } from "@/components/ui/pagination-control";

import NotifyHostModal from "./_components/NotifyHostModal";
import DeleteHostModal from "./_components/DeleteHostModal";

export default function HostManagementPage() {
  const showAlert = useAlertStore((s) => s.showAlert);
  const {
    hosts,
    hostsPagination,
    loading,
    error,
    fetchHosts,
    deleteHost,
    notifyHost,
  } = useAdminStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedHost, setSelectedHost] = useState<any>(null);
  const [isNotifyOpen, setIsNotifyOpen] = useState(false);
  const [notifySubject, setNotifySubject] = useState("");
  const [notifyBody, setNotifyBody] = useState("");
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    fetchHosts(undefined, 1, 10);
  }, [fetchHosts]);

  const copyToClipboard = (text: string, fieldId: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-4">
        <div className="space-y-2">
          <h1 className="text-4xl lg:text-5xl font-medium tracking-tight text-foreground leading-[1.1]">
            <span className="inline-flex items-center justify-center bg-card shadow-sm border border-black/5 dark:border-white/5 rounded-full p-2 mx-1 align-middle"><Users className="w-6 h-6 text-foreground" /></span> Host <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#a0f212] to-emerald-400 font-bold drop-shadow-[0_0_15px_rgba(160,242,18,0.2)]">Registry</span>
          </h1>
          <p className="text-muted-foreground font-medium pl-2">Oversee registered marketplace instructors, monitor bank routing credentials, and send targeted alerts.</p>
        </div>
        <Button 
          onClick={() => fetchHosts(undefined, hostsPagination?.page || 1, hostsPagination?.limit || 10)}
          disabled={loading}
          className="rounded-full px-6 py-6 font-bold shadow-xl transition-all duration-300 bg-[#0b0c01] text-white hover:bg-[#1a1c02] border-none flex-shrink-0"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Sync Registry
        </Button>
      </div>

      {error && (
        <div className="p-3 text-xs font-medium text-destructive bg-destructive/10 rounded-xl border border-destructive/20 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>Error loading hosts: {error}</span>
        </div>
      )}

      {/* Main Table Card */}
      <Card className="border-border/40 bg-card rounded-2xl shadow-xs overflow-hidden">
        <CardHeader className="pb-3 border-b border-black/5 dark:border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Users className="h-4 w-4 text-[#a0f212]" /> Instructor Management Directory
            </CardTitle>
            <CardDescription className="text-xs">
              Complete list of verified and candidate platform organizers.
            </CardDescription>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search host, email, bio..."
                className="pl-9 h-9 rounded-xl text-xs bg-muted/20"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              className="h-9 rounded-xl border border-black/5 dark:border-white/5 bg-card px-3 text-xs outline-none focus:ring-1 focus:ring-primary/20 text-muted-foreground font-semibold shrink-0 cursor-pointer"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active Hosts Only</option>
              <option value="SUSPENDED">Suspended Only</option>
            </select>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-black/5 dark:border-white/5 bg-muted/20 font-semibold text-muted-foreground">
                  <th className="py-3 px-4">Instructor Host</th>
                  <th className="py-3 px-4">Account & KYC</th>
                  <th className="py-3 px-4">Bank & UPI Routing</th>
                  <th className="py-3 px-4">Bio / Specialty</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-muted-foreground">
                      <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
                      Retrieving registered host accounts...
                    </td>
                  </tr>
                ) : filteredHosts.length > 0 ? (
                  filteredHosts.map((host) => {
                    const profile = host.hostProfile;
                    const bank = profile?.bankDetail;
                    const kycStatus = profile?.kycStatus || "PENDING";
                    const accountType = profile?.accountType || "INDIVIDUAL";

                    return (
                      <tr key={host.id} className="border-b border-black/5 dark:border-white/5 hover:bg-muted/10 last:border-none">
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-foreground">{host.firstName} {host.lastName}</span>
                            <span className="text-[10px] text-muted-foreground">{host.email}</span>
                            {host.phone && <span className="text-[10px] text-muted-foreground font-mono">{host.phone}</span>}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-black uppercase text-muted-foreground">
                              Type: {accountType}
                            </span>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase w-fit border ${
                              kycStatus === "APPROVED"
                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                : kycStatus === "PENDING"
                                ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                : "bg-destructive/10 text-destructive border-destructive/20"
                            }`}>
                              {kycStatus === "APPROVED" && <CheckCircle2 className="h-3 w-3" />}
                              {kycStatus === "PENDING" && <Clock className="h-3 w-3" />}
                              {kycStatus === "REJECTED" && <XCircle className="h-3 w-3" />}
                              KYC: {kycStatus}
                            </span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 max-w-[220px]">
                          {bank ? (
                            <div className="flex flex-col gap-1">
                              <span className="font-semibold text-foreground flex items-center gap-1">
                                <Landmark className="h-3 w-3 text-muted-foreground shrink-0" /> {bank.bankName}
                              </span>
                              <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono">
                                <span>A/C: {bank.accountNumber || "N/A"}</span>
                                {bank.accountNumber && (
                                  <button
                                    type="button"
                                    onClick={() => copyToClipboard(bank.accountNumber!, `acc-${host.id}`)}
                                    className="p-0.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground"
                                    title="Copy Account Number"
                                  >
                                    {copiedField === `acc-${host.id}` ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                                  </button>
                                )}
                              </div>
                              {bank.upiId && (
                                <div className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-[#a0f212] font-mono font-bold">
                                  <QrCode className="h-3 w-3 shrink-0" />
                                  <span>{bank.upiId}</span>
                                  <button
                                    type="button"
                                    onClick={() => copyToClipboard(bank.upiId!, `upi-${host.id}`)}
                                    className="p-0.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground"
                                    title="Copy UPI ID"
                                  >
                                    {copiedField === `upi-${host.id}` ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                                  </button>
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="italic text-muted-foreground/50">No banking details</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 max-w-[200px]">
                          <p className="text-[11px] text-muted-foreground line-clamp-2" title={profile?.bio || ""}>
                            {profile?.bio || "No bio provided."}
                          </p>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                            host.status === "ACTIVE"
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                              : "bg-destructive/10 text-destructive border-destructive/20"
                          }`}>
                            {host.status}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedHost(host);
                                setIsNotifyOpen(true);
                              }}
                              className="h-7 px-2.5 text-[10px] font-bold rounded-lg"
                              title="Send Email Alert"
                            >
                              <Mail className="h-3 w-3 mr-1" /> Notify
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setDeleteTargetId(host.id);
                                setIsDeleteOpen(true);
                              }}
                              className="h-7 px-2.5 text-[10px] font-bold rounded-lg border-destructive/20 text-destructive hover:bg-destructive/5"
                              title="Delete Host Account"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-muted-foreground">
                      <Users className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
                      <p className="font-bold text-sm">No instructor records found.</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Adjust your search query or filter parameters.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Generic Pagination Control */}
          {hostsPagination && (
            <PaginationControl
              currentPage={hostsPagination.page}
              totalPages={hostsPagination.totalPages}
              totalItems={hostsPagination.total}
              limit={hostsPagination.limit}
              onPageChange={(page) => fetchHosts(undefined, page, hostsPagination.limit)}
              onLimitChange={(limit) => fetchHosts(undefined, 1, limit)}
            />
          )}
        </CardContent>
      </Card>

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
