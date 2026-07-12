"use client";

import React, { useState, useEffect } from "react";
import { Search, Undo2, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAdminStore } from "@/features/admin/store/adminStore";
import { useAlertStore } from "@/features/alerts/store/alertStore";

interface RefundRequestsTableProps {
  onApproveRefund: (clientName: string, amount: string) => void;
}

export default function RefundRequestsTable({ onApproveRefund }: RefundRequestsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const showAlert = useAlertStore((s) => s.showAlert);
  const { refundRequests, fetchRefundRequests, approveRefund, declineRefund, loading: isLoading } = useAdminStore();

  useEffect(() => {
    fetchRefundRequests();
  }, [fetchRefundRequests]);

  const handleAction = async (id: string, action: "approve" | "decline", clientName: string, amount: string) => {
    try {
      if (action === "approve") {
        await approveRefund(id);
        onApproveRefund(clientName, amount);
        showAlert("Refund Approved", "The ticket refund request has been successfully approved.", "success");
      } else {
        await declineRefund(id);
        showAlert("Refund Declined", "The ticket refund request has been declined.", "warning");
      }
    } catch (err: any) {
      showAlert("Error", err.message || "Failed to process refund request action", "destructive");
    }
  };

  const filteredRequests = refundRequests.filter((req) => {
    const client = (req.clientName || "").toLowerCase();
    const event = (req.eventTitle || "").toLowerCase();
    const ref = (req.bookingRef || "").toLowerCase();
    const search = searchTerm.toLowerCase();

    return client.includes(search) || event.includes(search) || ref.includes(search);
  });

  return (
    <Card className="border-border/40 bg-card rounded-2xl shadow-xs overflow-hidden">
      <CardHeader className="pb-3 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            Client Ticket Refund Demands
            {isLoading && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
          </CardTitle>
          <CardDescription className="text-xs">Pending refunds authorization requests registry log.</CardDescription>
        </div>
        <div className="flex w-full sm:max-w-xs relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search client, event, booking ref..."
            className="pl-9 h-9 rounded-xl text-xs bg-muted/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b bg-muted/20 font-semibold text-muted-foreground">
                <th className="py-3 px-4">Client details</th>
                <th className="py-3 px-4">Booking & Course Title</th>
                <th className="py-3 px-4">Justification Reason</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Action Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.length > 0 ? (
                filteredRequests.map((req) => (
                  <tr key={req.id} className="border-b hover:bg-muted/10 last:border-none">
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-foreground">{req.clientName}</span>
                        <span className="text-[10px] text-muted-foreground">{req.email}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-foreground">{req.eventTitle}</span>
                        <span className="text-[9px] font-mono text-muted-foreground">REF: {req.bookingRef}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-muted-foreground max-w-[200px] truncate" title={req.reason}>
                      {req.reason}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-foreground">
                      {req.amount} INR
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md uppercase ${
                        req.status === "APPROVED"
                          ? "bg-emerald-500/10 text-emerald-600"
                          : req.status === "PENDING"
                          ? "bg-amber-500/10 text-amber-500"
                          : "bg-destructive/10 text-destructive"
                      }`}>
                        {req.status === "APPROVED" ? "REFUNDED" : req.status === "DECLINED" ? "REJECTED" : req.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {req.status === "PENDING" ? (
                        <div className="flex items-center justify-center gap-1.5">
                          <Button 
                            variant="default"
                            size="sm"
                            onClick={() => handleAction(req.id, "approve", req.clientName, req.amount)}
                            className="h-7 rounded-lg text-[10px] font-bold"
                          >
                            <Undo2 className="h-3 w-3 mr-1" /> Approve Refund
                          </Button>
                          <Button 
                            variant="outline"
                            size="sm"
                            onClick={() => handleAction(req.id, "decline", req.clientName, req.amount)}
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
      </CardContent>
    </Card>
  );
}
