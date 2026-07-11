import React, { useState } from "react";
import { Search, RefreshCw, Undo2, Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface RefundRequest {
  id: string;
  clientName: string;
  email: string;
  eventTitle: string;
  bookingRef: string;
  amount: string;
  reason: string;
  status: "PENDING" | "REFUNDED" | "REJECTED";
  dateRequested: string;
}

interface RefundRequestsTableProps {
  onApproveRefund: (clientName: string, amount: string) => void;
}

export default function RefundRequestsTable({ onApproveRefund }: RefundRequestsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [requests, setRequests] = useState<RefundRequest[]>([
    {
      id: "ref_1",
      clientName: "Alex Mercer",
      email: "alex.mercer@gmail.com",
      eventTitle: "Advanced Next.js 15 & React 19 Sprint",
      bookingRef: "BMS-837492",
      amount: "150.00",
      reason: "Class schedule conflict due to unexpected business travel.",
      status: "PENDING",
      dateRequested: "2026-07-10"
    },
    {
      id: "ref_2",
      clientName: "Jane Smith",
      email: "jane.smith@yahoo.com",
      eventTitle: "Gourmet Bread Baking Masterclass",
      bookingRef: "BMS-910283",
      amount: "75.00",
      reason: "Instructor rescheduled the timing twice, no longer convenient.",
      status: "PENDING",
      dateRequested: "2026-07-09"
    },
    {
      id: "ref_3",
      clientName: "Dharmesh Shah",
      email: "dharmesh@hubspot.com",
      eventTitle: "SaaS Startup Growth Strategy Guide",
      bookingRef: "BMS-482019",
      amount: "250.00",
      reason: "Emergency family health issue, cannot participate.",
      status: "PENDING",
      dateRequested: "2026-07-08"
    },
    {
      id: "ref_4",
      clientName: "Emily Watson",
      email: "emily@watsonart.co",
      eventTitle: "Digital Portrait Painting Techniques",
      bookingRef: "BMS-110293",
      amount: "110.00",
      reason: "Class content was too basic for advanced learners.",
      status: "REFUNDED",
      dateRequested: "2026-07-05"
    }
  ]);

  const handleAction = (id: string, nextStatus: "REFUNDED" | "REJECTED") => {
    const req = requests.find((r) => r.id === id);
    if (!req) return;

    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: nextStatus } : r))
    );

    if (nextStatus === "REFUNDED") {
      onApproveRefund(req.clientName, req.amount);
    }
  };

  const filteredRequests = requests.filter((req) => {
    const client = req.clientName.toLowerCase();
    const event = req.eventTitle.toLowerCase();
    const ref = req.bookingRef.toLowerCase();
    const search = searchTerm.toLowerCase();

    return client.includes(search) || event.includes(search) || ref.includes(search);
  });

  return (
    <Card className="border-border/40 bg-card rounded-2xl shadow-xs overflow-hidden">
      <CardHeader className="pb-3 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <CardTitle className="text-sm font-bold">Client Ticket Refund Demands</CardTitle>
          <CardDescription className="text-xs">Pending refunds authorization requests registry log (mock view).</CardDescription>
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
                      ${req.amount}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md uppercase ${
                        req.status === "REFUNDED"
                          ? "bg-emerald-500/10 text-emerald-600"
                          : req.status === "PENDING"
                          ? "bg-amber-500/10 text-amber-500"
                          : "bg-destructive/10 text-destructive"
                      }`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {req.status === "PENDING" ? (
                        <div className="flex items-center justify-center gap-1.5">
                          <Button 
                            variant="default"
                            size="sm"
                            onClick={() => handleAction(req.id, "REFUNDED")}
                            className="h-7 rounded-lg text-[10px] font-bold"
                          >
                            <Undo2 className="h-3 w-3 mr-1" /> Approve Refund
                          </Button>
                          <Button 
                            variant="outline"
                            size="sm"
                            onClick={() => handleAction(req.id, "REJECTED")}
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
