"use client";

import React, { useState, useEffect } from "react";
import { Search, Undo2, Loader2, IndianRupee, AlertCircle, Clock, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAdminStore } from "@/features/admin/store/adminStore";
import { useAlertStore } from "@/features/alerts/store/alertStore";
import { PaginationControl } from "@/components/ui/pagination-control";
import ConfirmRefundModal from "./ConfirmRefundModal";

interface RefundRequestsTableProps {
  onApproveRefund: (clientName: string, amount: string) => void;
}

export default function RefundRequestsTable({ onApproveRefund }: RefundRequestsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("PENDING"); // Pending First by default!
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const showAlert = useAlertStore((s) => s.showAlert);
  const { refundRequests, refundsPagination, fetchRefundRequests, approveRefund, declineRefund, loading: isLoading } = useAdminStore();

  useEffect(() => {
    fetchRefundRequests(1, 10);
  }, [fetchRefundRequests]);

  const handleProcessRefund = async (refundId: string, mode: "AUTOMATIC" | "MANUAL", manualRef?: string) => {
    setActionLoading(true);
    try {
      const result = await approveRefund(refundId, mode, manualRef);
      if (result.success) {
        const modeLabel = result.mode === "MANUAL" ? "Manual Transfer" : "Razorpay Reversal";
        showAlert(
          "Refund Approved",
          `Ticket refund of ₹${selectedRequest?.amount || ""} has been approved via ${modeLabel} (Reference: ${result.refundTxnId || "N/A"}).`,
          "success"
        );
        setIsConfirmOpen(false);
        setSelectedRequest(null);
      } else {
        showAlert(
          "Refund Unsuccessful",
          result.message || "Razorpay refund failed. Please try Manual Refund.",
          "warning"
        );
      }
    } catch (err: any) {
      showAlert("Error", err.message || "Failed to process refund request", "destructive");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDecline = async (id: string) => {
    try {
      await declineRefund(id);
      showAlert("Refund Declined", "The ticket refund request has been declined.", "warning");
    } catch (err: any) {
      showAlert("Error", err.message || "Failed to decline refund request", "destructive");
    }
  };

  const safeRequests = Array.isArray(refundRequests) ? refundRequests : [];

  const filteredRequests = safeRequests.filter((req) => {
    if (statusFilter !== "ALL" && req.status !== statusFilter) return false;

    const client = (req.clientName || "").toLowerCase();
    const event = (req.eventTitle || "").toLowerCase();
    const ref = (req.bookingRef || "").toLowerCase();
    const search = searchTerm.toLowerCase();

    return !searchTerm || client.includes(search) || event.includes(search) || ref.includes(search);
  });

  return (
    <div className="space-y-6">
      
      {/* Main Table Card */}
      <Card className="border-border/40 bg-card rounded-2xl shadow-xs overflow-hidden">
        <CardHeader className="pb-3 border-b border-black/5 dark:border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Undo2 className="h-4 w-4 text-amber-500" /> Client Ticket Refund Demands
              {isLoading && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
            </CardTitle>
            <CardDescription className="text-xs">Pending and authorized refund requests log. Showing pending first.</CardDescription>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search client, event, booking ref..."
                className="pl-9 h-9 rounded-xl text-xs bg-muted/20"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Status Filter (Pending First by default!) */}
            <select
              className="h-9 rounded-xl border border-black/5 dark:border-white/5 bg-card px-3 text-xs outline-none focus:ring-1 focus:ring-primary/20 text-muted-foreground font-semibold shrink-0 cursor-pointer"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="PENDING">Pending Demands First</option>
              <option value="APPROVED">Approved / Refunded</option>
              <option value="DECLINED">Declined / Rejected</option>
              <option value="ALL">All Requests</option>
            </select>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-black/5 dark:border-white/5 bg-muted/20 font-semibold text-muted-foreground">
                  <th className="py-3 px-4">Client Details</th>
                  <th className="py-3 px-4">Booking & Workshop Title</th>
                  <th className="py-3 px-4">Justification Reason</th>
                  <th className="py-3 px-4">Amount Needed to Refund</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-muted-foreground">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
                      Retrieving refund requests log...
                    </td>
                  </tr>
                ) : filteredRequests.length > 0 ? (
                  filteredRequests.map((req) => (
                    <tr key={req.id} className="border-b border-black/5 dark:border-white/5 hover:bg-muted/10 last:border-none">
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-foreground">{req.clientName}</span>
                          <span className="text-[10px] text-muted-foreground">{req.email}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 max-w-[200px]">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-semibold text-foreground truncate">{req.eventTitle}</span>
                          <span className="text-[9px] font-mono text-muted-foreground">REF: {req.bookingRef}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-muted-foreground max-w-[200px] truncate" title={req.reason}>
                        {req.reason || "Client request"}
                      </td>

                      <td className="py-3.5 px-4 font-black text-amber-600 dark:text-amber-400 text-sm">
                        ₹{Number(req.amount || 0).toLocaleString()} INR
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-flex items-center gap-1 text-[9px] font-extrabold px-2 py-0.5 rounded-md uppercase border ${
                          req.status === "APPROVED"
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                            : req.status === "PENDING"
                            ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                            : "bg-destructive/10 text-destructive border-destructive/20"
                        }`}>
                          {req.status === "APPROVED" && <CheckCircle2 className="h-3 w-3" />}
                          {req.status === "PENDING" && <Clock className="h-3 w-3" />}
                          {req.status === "DECLINED" && <XCircle className="h-3 w-3" />}
                          {req.status === "APPROVED" ? "REFUNDED" : req.status === "DECLINED" ? "REJECTED" : req.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {req.status === "PENDING" ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <Button 
                              variant="default"
                              size="sm"
                              onClick={() => {
                                setSelectedRequest(req);
                                setIsConfirmOpen(true);
                              }}
                              className="h-7 rounded-lg text-[10px] font-bold bg-amber-500 hover:bg-amber-600 text-white"
                            >
                              <Undo2 className="h-3 w-3 mr-1" /> Approve Refund
                            </Button>
                            <Button 
                              variant="outline"
                              size="sm"
                              onClick={() => handleDecline(req.id)}
                              className="h-7 rounded-lg text-[10px] font-bold border-destructive/20 text-destructive hover:bg-destructive/5"
                            >
                              Decline
                            </Button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-muted-foreground font-semibold">Processed</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-muted-foreground text-xs">
                      No matching refund requests found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Control */}
          {refundsPagination && (
            <PaginationControl
              currentPage={refundsPagination.page}
              totalPages={refundsPagination.totalPages}
              totalItems={refundsPagination.total}
              limit={refundsPagination.limit}
              onPageChange={(page) => fetchRefundRequests(page, refundsPagination.limit)}
              onLimitChange={(limit) => fetchRefundRequests(1, limit)}
            />
          )}
        </CardContent>
      </Card>

      {/* CONFIRM REFUND MODAL */}
      <ConfirmRefundModal
        isOpen={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        selectedRequest={selectedRequest}
        refundLoading={actionLoading}
        onConfirm={handleProcessRefund}
        onCancel={() => {
          setIsConfirmOpen(false);
          setSelectedRequest(null);
        }}
      />

    </div>
  );
}
