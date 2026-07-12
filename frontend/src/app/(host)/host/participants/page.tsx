"use client";

import React, { useState, useEffect } from "react";
import { Users, Search, Loader2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import ProgramRowCard from "@/components/ui/program-row-card";
import { useHostStore } from "@/features/host/store/hostStore";

export default function HostParticipantsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const { myEvents, participants, fetchMyEvents, fetchParticipants, isLoading } = useHostStore();

  useEffect(() => {
    fetchMyEvents();
    fetchParticipants();
  }, [fetchMyEvents, fetchParticipants]);

  // Map programs and aggregate statistics for confirmed students from DB
  const programsWithRoster = myEvents.map((event: any) => {
    // Get actual bookings matching this event
    const eventBookings = participants.filter((b: any) => b.eventId === event.id);

    // Sum up spots booked for CONFIRMED bookings
    const enrolledCount = eventBookings
      .filter((b: any) => b.status === "CONFIRMED" || b.status === "COMPLETED")
      .reduce((sum: number, b: any) => sum + b.seatCount, 0);

    return {
      id: event.id,
      title: event.title,
      imageUrl: event.posterUrl || "https://images.unsplash.com/photo-1618401471353-b98aedd07871?auto=format&fit=crop&q=80&w=600",
      status: event.status.toLowerCase(),
      category: event.mode,
      duration: "2 hours",
      spotsLeft: event.availableSeats,
      maxSpots: event.totalSeats,
      location: event.mode === "ONLINE" ? "Online Zoom link" : (event.venueDetails?.address || "Physical Venue"),
      price: 500,
      enrolledCount,
      date: new Date(event.startTime).toLocaleDateString(),
      time: new Date(event.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
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
          {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
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
