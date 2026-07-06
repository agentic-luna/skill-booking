"use client";

import React, { useState } from "react";
import { Users, Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { MOCK_PROGRAMS, MOCK_BOOKINGS } from "@/constants/mockData";
import ProgramRowCard from "@/components/ui/program-row-card";

export default function HostParticipantsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  // Map programs and aggregate statistics for confirmed students
  const programsWithRoster = MOCK_PROGRAMS.map((prog) => {
    // Get actual bookings matching this program title or ID
    const actualBookings = MOCK_BOOKINGS.filter(
      (b) => b.programId === prog.id || b.programTitle === prog.title
    );

    // Build the student list counts for mock presentation purposes
    let enrolledCount = actualBookings.filter(
      (b) => b.status === "confirmed" || b.status === "completed"
    ).reduce((sum, b) => sum + b.spotsBooked, 0);

    // Mock count overrides to display interesting data
    if (enrolledCount === 0 && prog.status === "approved") {
      if (prog.id === "prog_2") {
        enrolledCount = 3;
      } else if (prog.id === "prog_4") {
        enrolledCount = 1;
      }
    }

    return {
      ...prog,
      enrolledCount,
    };
  });

  // Filter programs based on Search Term
  const filteredPrograms = programsWithRoster.filter((item) =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="space-y-1 pb-4 border-b">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" /> Roster Board
        </h1>
        <p className="text-sm text-muted-foreground font-medium">
          Select any active skill workshop to review confirmed learners and verify ticket payments.
        </p>
      </div>

      {/* Search Input */}
      <div className="flex max-w-md relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search by workshop title..."
          className="pl-9 h-10 rounded-xl bg-card border-border/40"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Program Row Cards */}
      <div className="space-y-4">
        {filteredPrograms.length > 0 ? (
          filteredPrograms.map((prog) => (
            <ProgramRowCard
              key={prog.id}
              program={prog}
              href={`/host/participants/${prog.id}`}
            />
          ))
        ) : (
          <div className="text-center py-10 bg-card rounded-2xl border border-border/40 text-muted-foreground text-xs font-semibold">
            No matching programs found in your roster listings.
          </div>
        )}
      </div>
    </div>
  );
}
