"use client";

import React, { useState } from "react";
import { CheckSquare, Check, X, Search, Clock, Ticket, Star, MapPin } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MOCK_PROGRAMS, Program } from "@/constants/mockData";

export default function AdminApprovalsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [approvalsList, setApprovalsList] = useState<Program[]>(
    MOCK_PROGRAMS.filter((p) => p.status === "pending")
  );

  const handleStatusChange = (progId: string, newStatus: "approved" | "rejected") => {
    // Update local state list
    setApprovalsList((prev) => prev.filter((p) => p.id !== progId));

    // Update global catalog master array
    const idx = MOCK_PROGRAMS.findIndex((p) => p.id === progId);
    if (idx !== -1) {
      MOCK_PROGRAMS[idx].status = newStatus;
    }
    
    alert(`Workshop listing status set to: ${newStatus.toUpperCase()}`);
  };

  const filteredApprovals = approvalsList.filter((prog) => {
    return (
      prog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prog.instructorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prog.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="space-y-1 pb-4 border-b">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
          <CheckSquare className="h-6 w-6 text-primary" /> Program Approvals
        </h1>
        <p className="text-sm text-muted-foreground">Review and approve candidate class programs before they go live on explore feeds.</p>
      </div>

      {/* Filters */}
      <div className="flex max-w-md relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search pending programs, category, or instructor..."
          className="pl-9 h-10 rounded-xl"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Approvals list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredApprovals.length > 0 ? (
          filteredApprovals.map((prog) => (
            <Card key={prog.id} className="overflow-hidden border-border/40 bg-card rounded-2xl flex flex-col justify-between shadow-xs">
              <div className="relative aspect-video w-full bg-muted">
                <img src={prog.imageUrl} alt={prog.title} className="object-cover w-full h-full" />
                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded-md font-semibold capitalize">
                  {prog.category}
                </div>
              </div>

              <div className="p-5 flex-1 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <img src={prog.instructorAvatar} alt={prog.instructorName} className="h-5 w-5 rounded-full object-cover" />
                    <span className="text-[10px] text-muted-foreground">Instructor: <span className="font-semibold text-foreground">{prog.instructorName}</span></span>
                  </div>

                  <h3 className="font-bold text-sm text-foreground line-clamp-1 leading-tight">
                    {prog.title}
                  </h3>

                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {prog.description}
                  </p>

                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] text-muted-foreground border-t pt-3">
                    <span className="flex items-center"><Clock className="h-3.5 w-3.5 mr-1" /> {prog.duration}</span>
                    <span className="flex items-center"><MapPin className="h-3.5 w-3.5 mr-1" /> {prog.location.split(",")[0]}</span>
                    <span className="flex items-center"><Ticket className="h-3.5 w-3.5 mr-1" /> Spots cap: {prog.maxSpots}</span>
                    <span className="flex items-center font-bold text-foreground">Fee: ${prog.price}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t mt-auto">
                  <Button 
                    variant="outline" 
                    className="w-full text-xs font-semibold h-9 border-destructive/20 text-destructive hover:bg-destructive/5"
                    onClick={() => handleStatusChange(prog.id, "rejected")}
                  >
                    <X className="mr-1 h-3.5 w-3.5" /> Decline
                  </Button>
                  <Button 
                    className="w-full text-xs font-semibold h-9"
                    onClick={() => handleStatusChange(prog.id, "approved")}
                  >
                    <Check className="mr-1 h-3.5 w-3.5" /> Approve Live
                  </Button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="col-span-2 text-center p-12 bg-card border rounded-2xl border-dashed border-border/60 text-muted-foreground text-xs">
            Approvals queue is empty. No pending programs need review.
          </div>
        )}
      </div>

    </div>
  );
}
