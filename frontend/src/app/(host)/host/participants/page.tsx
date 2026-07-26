"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Users, Search, Loader2, Calendar, MapPin, ChevronRight, UserCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useHostStore } from "@/features/host/store/hostStore";

export default function HostParticipantsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const { myEvents, participants, fetchMyEvents, fetchParticipants, isLoading } = useHostStore();

  useEffect(() => {
    fetchMyEvents();
    fetchParticipants();
  }, [fetchMyEvents, fetchParticipants]);

  const programsWithRoster = myEvents.map((event: any) => {
    const eventBookings = participants.filter((b: any) => b.eventId === event.id);
    const enrolledCount = eventBookings
      .filter((b: any) => b.status === "CONFIRMED" || b.status === "COMPLETED")
      .reduce((sum: number, b: any) => sum + b.seatCount, 0);

    return {
      id: event.id,
      title: event.title,
      imageUrl: event.posterUrl || "https://images.unsplash.com/photo-1618401471353-b98aedd07871?auto=format&fit=crop&q=80&w=600",
      status: event.status.toLowerCase(),
      category: event.mode,
      duration: event.duration || "N/A",
      maxSpots: event.totalSeats,
      location: event.mode === "ONLINE" ? "Online Zoom link" : (event.venueDetails?.address || "Physical Venue"),
      price: event.price ?? 0,
      enrolledCount,
      startDate: new Date(event.startTime),
    };
  });

  const filteredPrograms = programsWithRoster.filter((item) =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-2">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-[#0b0c01] flex items-center gap-3">
            <div className="bg-[#a0f212] p-2 rounded-xl text-[#0b0c01] shadow-sm"><Users className="h-6 w-6" /></div>
            Participants
            {isLoading && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground ml-2" />}
          </h1>
          <p className="text-muted-foreground font-medium text-sm">
            Select an active skill workshop to review confirmed learners and ticket payments.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by workshop title..."
            className="pl-11 h-12 rounded-2xl bg-white border border-black/5 shadow-sm text-sm font-medium focus-visible:ring-[#a0f212]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Participants Cards List */}
      <div className="space-y-5">
        {filteredPrograms.length > 0 ? (
          filteredPrograms.map((prog) => {
            const fillPercentage = Math.min(100, ((prog.enrolledCount) / (prog.maxSpots || 1)) * 100);

            return (
              <div
                key={prog.id}
                className="bg-white rounded-[32px] p-4 flex flex-col xl:flex-row gap-6 shadow-sm border border-black/5 hover:shadow-xl transition-all duration-300 group"
              >
                {/* Image Section */}
                <div className="h-32 xl:w-48 shrink-0 rounded-2xl overflow-hidden relative shadow-inner">
                  <img src={prog.imageUrl} alt={prog.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute top-2 left-2 bg-[#0b0c01]/80 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider text-[#a0f212]">
                    {prog.category}
                  </div>
                </div>

                {/* Info Section */}
                <div className="flex-1 min-w-0 flex flex-col justify-center py-2">
                  <h2 className="text-xl font-extrabold text-[#0b0c01] leading-tight truncate">{prog.title}</h2>

                  <div className="mt-3 flex items-center gap-4 text-sm font-semibold text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-[#a0f212]" />
                      {prog.startDate.toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-[#a0f212]" />
                      <span className="truncate max-w-[150px]">{prog.location}</span>
                    </div>
                  </div>
                </div>

                {/* Utilization Section */}
                <div className="xl:w-64 shrink-0 flex flex-col justify-center py-2 border-t xl:border-t-0 xl:border-l border-black/5 pt-4 xl:pt-2 xl:pl-6 xl:ml-2">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Fill Rate</span>
                    <span className="text-sm font-black text-[#0b0c01]">{Math.round(fillPercentage)}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#a0f212] rounded-full transition-all duration-1000"
                      style={{ width: `${fillPercentage}%` }}
                    />
                  </div>
                  <div className="mt-3 flex items-center gap-1.5 text-sm font-extrabold text-[#0b0c01]">
                    <UserCheck className="w-4 h-4 text-muted-foreground" />
                    <span>{prog.enrolledCount} <span className="text-muted-foreground font-semibold">/ {prog.maxSpots} enrolled</span></span>
                  </div>
                </div>

                {/* Action Section */}
                <div className="shrink-0 flex items-center justify-center pt-4 xl:pt-2 xl:pl-6 xl:border-l border-black/5 py-2 pr-2">
                  <Link href={`/host/participants/${prog.id}`} className="w-full xl:w-auto">
                    <Button className="w-full xl:w-auto h-12 px-6 rounded-2xl bg-[#0b0c01] text-[#a0f212] hover:bg-black/80 font-bold shadow-md transition-transform hover:-translate-y-0.5 group/btn">
                      View Participants
                      <ChevronRight className="ml-2 w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-20 bg-white/50 rounded-[40px] border border-black/5 text-muted-foreground text-sm font-semibold shadow-sm">
            No matching programs found in your workshop listings.
          </div>
        )}
      </div>
    </div>
  );
}
