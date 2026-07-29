"use client";

import React, { useEffect, useState } from "react";
import { getBoostRequests, updateBoostStatus } from "@/features/admin/api/admin.api";
import { useAlertStore } from "@/features/alerts/store/alertStore";
import { Rocket, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminBoostRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const showAlert = useAlertStore((s) => s.showAlert);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const data = await getBoostRequests();
      setRequests(data || []);
    } catch (error) {
      showAlert("Error", "Failed to fetch boost requests", "destructive");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleUpdate = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await updateBoostStatus(id, status);
      showAlert("Success", `Boost request ${status.toLowerCase()}`, "success");
      fetchRequests();
    } catch (error) {
      showAlert("Error", "Failed to update status", "destructive");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#0b0c01] flex items-center gap-3">
            <div className="bg-[#a0f212] p-2 rounded-xl text-[#0b0c01] shadow-sm">
              <Rocket className="h-6 w-6" />
            </div>
            Boost Requests
          </h1>
          <p className="text-muted-foreground mt-1">
            Review the history of event boost requests. Payment is automatically verified via Razorpay.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white border rounded-2xl p-12 text-center text-muted-foreground">
          No pending boost requests found.
        </div>
      ) : (
        <div className="grid gap-4">
          {requests.map((req) => (
            <div key={req.id} className="bg-white border border-black/5 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="font-bold text-lg">{req.event?.title || "Unknown Event"}</h3>
                <div className="text-sm text-muted-foreground mt-1 space-y-1">
                  <p><strong>Host:</strong> {req.event?.host?.user?.firstName} {req.event?.host?.user?.lastName}</p>
                  <p><strong>Duration:</strong> {new Date(req.startDate).toLocaleDateString()} to {new Date(req.endDate).toLocaleDateString()}</p>
                  <p><strong>Status:</strong> <span className="uppercase font-bold text-blue-500">{req.status}</span></p>
                </div>
              </div>
              <div className="flex gap-3">
                {req.status === 'PENDING' && (
                  <>
                    <Button 
                      onClick={() => handleUpdate(req.id, 'APPROVED')}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" /> Approve
                    </Button>
                    <Button 
                      variant="destructive"
                      onClick={() => handleUpdate(req.id, 'REJECTED')}
                    >
                      <XCircle className="h-4 w-4 mr-2" /> Reject
                    </Button>
                  </>
                )}
                {req.status !== 'PENDING' && (
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${req.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                    {req.status}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
