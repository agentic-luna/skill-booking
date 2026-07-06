"use client";

import React, { useState } from "react";
import {
  CheckSquare, Check, X, Search, Clock, Ticket, Star, MapPin,
  Eye, Calendar, DollarSign, User, ShieldAlert, Award
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { MOCK_PROGRAMS, Program } from "@/constants/mockData";

export default function AdminApprovalsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [approvalsList, setApprovalsList] = useState<Program[]>(
    MOCK_PROGRAMS.filter((p) => p.status === "pending")
  );

  const handleStatusChange = (progId: string, newStatus: "approved" | "rejected") => {
    // Close modal if open
    setSelectedProgram(null);

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
            <Card key={prog.id} className="overflow-hidden border-border/40 bg-card rounded-2xl flex flex-col justify-between shadow-xs hover:shadow-sm transition-shadow">
              <div
                className="relative aspect-video w-full bg-muted cursor-pointer group"
                onClick={() => setSelectedProgram(prog)}
              >
                <img src={prog.imageUrl} alt={prog.title} className="object-cover w-full h-full group-hover:scale-[1.02] transition-transform duration-300" />
                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded-md font-semibold capitalize">
                  {prog.category}
                </div>
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                  <div className="flex items-center space-x-1.5 text-xs text-white font-bold bg-black/50 px-3.5 py-2 rounded-xl backdrop-blur-xs">
                    <Eye className="h-4 w-4" />
                    <span>Quick Review</span>
                  </div>
                </div>
              </div>

              <div className="p-5 flex-1 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <img src={prog.instructorAvatar} alt={prog.instructorName} className="h-5 w-5 rounded-full object-cover" />
                    <span className="text-[10px] text-muted-foreground">Instructor: <span className="font-semibold text-foreground">{prog.instructorName}</span></span>
                  </div>

                  <h3
                    className="font-bold text-sm text-foreground line-clamp-1 leading-tight hover:text-primary cursor-pointer transition-colors"
                    onClick={() => setSelectedProgram(prog)}
                  >
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

                <div className="flex flex-col gap-2 pt-2 border-t mt-auto">
                  <Button
                    variant="outline"
                    className="w-full text-xs font-semibold h-9 rounded-xl border-border/60 hover:bg-muted"
                    onClick={() => setSelectedProgram(prog)}
                  >
                    <Eye className="mr-1.5 h-3.5 w-3.5" /> Full Details & Review
                  </Button>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="w-full text-xs font-semibold h-9 rounded-xl border-destructive/20 text-destructive hover:bg-destructive/5"
                      onClick={() => handleStatusChange(prog.id, "rejected")}
                    >
                      <X className="mr-1 h-3.5 w-3.5" /> Decline
                    </Button>
                    <Button 
                      className="w-full text-xs font-semibold h-9 rounded-xl shadow-xs"
                      onClick={() => handleStatusChange(prog.id, "approved")}
                    >
                      <Check className="mr-1 h-3.5 w-3.5" /> Approve Live
                    </Button>
                  </div>
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

      {/* FULL PROGRAM DETAIL DIALOG MODAL */}
      <Dialog open={selectedProgram !== null} onOpenChange={() => setSelectedProgram(null)}>
        {selectedProgram && (
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl">
            <DialogHeader>
              <div className="flex items-center space-x-2">
                <span className="text-[9px] font-extrabold px-2 py-0.5 rounded bg-primary/10 text-primary uppercase tracking-wider">
                  {selectedProgram.category}
                </span>
                <span className="text-[9px] font-extrabold px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 uppercase tracking-wider">
                  {selectedProgram.status}
                </span>
              </div>
              <DialogTitle className="text-base font-extrabold leading-snug pt-1">
                {selectedProgram.title}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Detailed metadata review of requested workshop listing.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5 py-2">
              {/* Program Banner */}
              <div className="aspect-video w-full rounded-xl overflow-hidden border bg-muted relative">
                <img src={selectedProgram.imageUrl} alt={selectedProgram.title} className="object-cover w-full h-full" />
              </div>

              {/* Grid Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs border bg-muted/20 p-4 rounded-xl">
                <div className="flex items-center space-x-2.5">
                  <Calendar className="h-4.5 w-4.5 text-muted-foreground shrink-0" />
                  <div>
                    <div className="text-[9px] font-semibold text-muted-foreground uppercase">Schedule Date</div>
                    <div className="font-bold text-foreground">{selectedProgram.date}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2.5">
                  <Clock className="h-4.5 w-4.5 text-muted-foreground shrink-0" />
                  <div>
                    <div className="text-[9px] font-semibold text-muted-foreground uppercase">Class Duration</div>
                    <div className="font-bold text-foreground">{selectedProgram.duration} ({selectedProgram.time})</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2.5">
                  <DollarSign className="h-4.5 w-4.5 text-muted-foreground shrink-0" />
                  <div>
                    <div className="text-[9px] font-semibold text-muted-foreground uppercase">Admission Price</div>
                    <div className="font-extrabold text-foreground">${selectedProgram.price} USD</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2.5">
                  <Ticket className="h-4.5 w-4.5 text-muted-foreground shrink-0" />
                  <div>
                    <div className="text-[9px] font-semibold text-muted-foreground uppercase">Enrollment Cap</div>
                    <div className="font-bold text-foreground">{selectedProgram.maxSpots} Seats Available</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2.5 sm:col-span-2 border-t pt-2 mt-1">
                  <MapPin className="h-4.5 w-4.5 text-muted-foreground shrink-0" />
                  <div>
                    <div className="text-[9px] font-semibold text-muted-foreground uppercase">Workshop Venue</div>
                    <div className="font-bold text-foreground">{selectedProgram.location}</div>
                  </div>
                </div>
              </div>

              {/* Instructor Card */}
              <div className="flex items-center space-x-3 bg-muted/40 p-3 rounded-xl border">
                <img
                  src={selectedProgram.instructorAvatar}
                  alt={selectedProgram.instructorName}
                  className="h-10 w-10 rounded-full object-cover border border-border/20 shadow-xs"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-[9px] font-semibold text-muted-foreground uppercase">Instructor Profile</div>
                  <h4 className="text-xs font-extrabold text-foreground">{selectedProgram.instructorName}</h4>
                </div>
                {selectedProgram.rating && (
                  <div className="flex items-center space-x-1 text-xs font-bold bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded-lg shrink-0">
                    <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                    <span>{selectedProgram.rating}★</span>
                  </div>
                )}
              </div>

              {/* Full Description */}
              <div className="space-y-1.5">
                <div className="text-[10px] font-bold text-muted-foreground uppercase">Syllabus & Syllabus Objectives</div>
                <div className="text-xs text-foreground leading-relaxed bg-card border rounded-xl p-4 max-h-[150px] overflow-y-auto custom-scrollbar">
                  {selectedProgram.description}
                </div>
              </div>
            </div>

            <DialogFooter className="border-t pt-4 gap-2 sm:gap-0">
              <Button
                variant="outline"
                type="button"
                className="text-xs h-9 rounded-xl"
                onClick={() => setSelectedProgram(null)}
              >
                Close View
              </Button>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="text-xs font-semibold h-9 rounded-xl border-destructive/20 text-destructive hover:bg-destructive/5"
                  onClick={() => handleStatusChange(selectedProgram.id, "rejected")}
                >
                  <X className="mr-1 h-3.5 w-3.5" /> Decline Listing
                </Button>
                <Button 
                  className="text-xs font-semibold h-9 rounded-xl shadow-xs"
                  onClick={() => handleStatusChange(selectedProgram.id, "approved")}
                >
                  <Check className="mr-1 h-3.5 w-3.5" /> Approve Listing
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

    </div>
  );
}
