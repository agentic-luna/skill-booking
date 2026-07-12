"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { Plus, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import ProgramCard from "@/components/ui/program-card";
import { useHostStore } from "@/features/host/store/hostStore";

export default function HostProgramsPage() {
  const { myEvents, fetchMyEvents, isLoading } = useHostStore();

  useEffect(() => {
    fetchMyEvents();
  }, [fetchMyEvents]);

  const programsList = myEvents.map((event: any) => ({
    id: event.id,
    title: event.title,
    imageUrl: event.posterUrl || "https://images.unsplash.com/photo-1618401471353-b98aedd07871?auto=format&fit=crop&q=80&w=600",
    status: event.status.toLowerCase(), // approved, pending, rejected, canceled
    category: event.category || event.mode, // prefer category field, fallback to mode
    duration: event.duration || "N/A",
    spotsLeft: event.availableSeats,
    maxSpots: event.totalSeats,
    location: event.mode === "ONLINE" ? "Online Meeting" : (typeof event.venueDetails === "string" ? event.venueDetails : event.venueDetails?.address || "Physical Venue"),
    price: event.price ?? 0, // use actual price from API
    description: event.description || "",
  }));

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div className="flex justify-between items-center pb-4 border-b">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            Program Management
            {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          </h1>
          <p className="text-sm text-muted-foreground">List, check validation status, and edit details of your skill classes.</p>
        </div>
        <Link href="/host/programs/create">
          <Button className="rounded-xl h-10 text-xs font-semibold">
            <Plus className="mr-1.5 h-4 w-4" /> Create Workshop
          </Button>
        </Link>
      </div>

      {/* Program grid list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {programsList.map((prog) => (
          <ProgramCard key={prog.id} program={prog as any} />
        ))}
      </div>

      {/* Empty state */}
      {!isLoading && programsList.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="bg-muted/50 p-4 rounded-full">
            <Plus className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-foreground">No programs yet</h3>
            <p className="text-xs text-muted-foreground max-w-sm">
              Create your first workshop to start accepting bookings from learners.
            </p>
          </div>
          <Link href="/host/programs/create">
            <Button className="rounded-xl h-9 text-xs font-semibold">
              <Plus className="mr-1.5 h-3.5 w-3.5" /> Create Your First Workshop
            </Button>
          </Link>
        </div>
      )}

    </div>
  );
}
