"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { Calendar, Clock, MapPin, Star, Sparkles, Loader2, ArrowLeft } from "lucide-react";
import { useClientStore } from "@/features/client/store/clientStore";

export default function FeaturedProgramsPage() {
  const { events, fetchEvents, loading } = useClientStore();

  useEffect(() => {
    fetchEvents();
  }, []);

  const featuredList = events.filter(
    (e) => e.status === "APPROVED" && e.boostedEvent && e.boostedEvent.isActive && e.boostedEvent.status === "ACTIVE"
  );

  return (
    <main className="min-h-screen bg-[#fcfcfc] dark:bg-[#0a0a0a] pb-20 pt-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Back Link */}
        <Link
          href="/programs"
          className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors mb-6 group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
          Back to Listings
        </Link>

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 pb-8 border-b border-black/5 dark:border-white/5 mb-10">
          <div className="space-y-2">
            <span className="text-[10px] text-primary uppercase font-bold tracking-widest flex items-center gap-1.5 animate-pulse">
              <Sparkles className="h-3.5 w-3.5 text-[#a0f212]" /> Premium Spotlights
            </span>
            <h1 className="text-3xl lg:text-5xl font-black text-[#0b0c01] dark:text-white tracking-tight">
              Featured Events
            </h1>
            <p className="text-sm text-muted-foreground max-w-xl font-medium">
              Explore the top-rated programs, certified training workshops, and popular learning sessions verified by our team.
            </p>
          </div>
          <span className="text-xs bg-[#a0f212]/10 border border-[#a0f212]/30 text-emerald-800 dark:text-[#a0f212] px-3.5 py-1.5 rounded-full font-extrabold shadow-sm shrink-0">
            {featuredList.length} Spotlight Programs
          </span>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#a0f212]" />
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-widest">Loading Features</p>
          </div>
        ) : featuredList.length === 0 ? (
          <div className="text-center py-20 bg-white border border-black/5 rounded-[32px] p-8 max-w-md mx-auto space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto text-xl font-black">★</div>
            <div className="space-y-1">
              <h3 className="font-extrabold text-sm text-[#0b0c01]">No Featured Events Currently</h3>
              <p className="text-xs text-muted-foreground">Check back shortly to discover curated workshops pinned here.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredList.map((prog) => {
              const instructorName = prog.trainerName || (prog.host?.user ? `${prog.host.user.firstName} ${prog.host.user.lastName}` : "Platform Host");
              const price = prog.price || prog.venueDetails?.price || 0;

              return (
                <Link
                  key={prog.id}
                  href={`/programs/${prog.id}`}
                  className="group flex flex-col bg-white border border-border/20 rounded-3xl overflow-hidden shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-1 relative cursor-pointer"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted/20">
                    <img
                      src={prog.posterUrl || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80"}
                      alt={prog.title}
                      className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    {/* Glowing Featured Badge */}
                    <div className="absolute top-4 left-4 flex gap-2 z-10">
                      <div className="bg-white/20 backdrop-blur-md border border-white/30 text-white text-[10px] px-3 py-1 rounded-full font-bold tracking-wide capitalize shadow-sm">
                        {prog.category || "General"}
                      </div>
                      <div className="bg-[#a0f212] text-[#0b0c01] text-[9px] px-3 py-1 rounded-full font-black tracking-widest uppercase shadow-[0_0_12px_rgba(160,242,18,0.4)] flex items-center gap-1">
                        <span>★</span> FEATURED
                      </div>
                    </div>

                    {/* Scarcity Tension Badge */}
                    <div className="absolute top-4 right-4 z-10">
                      {prog.availableSeats <= 0 ? (
                        <span className="bg-red-600 border border-red-500/30 text-white text-[9px] px-2.5 py-1 rounded-full font-black uppercase tracking-wider shadow-sm">
                          Sold Out
                        </span>
                      ) : (
                        <span className="bg-[#0d1e17] border border-[#a0f212]/30 text-[#a0f212] text-[9px] px-2.5 py-1 rounded-full font-black uppercase tracking-wider shadow-sm">
                          ⚡ {prog.availableSeats} slots left
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col flex-1 p-6 gap-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 mr-auto min-w-0">
                        <div className="h-6 w-6 rounded-full bg-[#0b0c01] text-[#a0f212] flex items-center justify-center text-[8px] font-extrabold ring-2 ring-background shadow-sm shrink-0">
                          {instructorName.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase()}
                        </div>
                        <span className="text-xs font-semibold text-muted-foreground truncate">{instructorName}</span>
                      </div>
                      {prog.rating && prog.rating >= 2 ? (
                        <div className="flex items-center bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full shrink-0">
                          <Star className="h-3 w-3 fill-amber-500 text-amber-500 mr-1" />
                          <span className="text-xs font-bold text-amber-700 dark:text-amber-500">
                            {prog.rating.toFixed(1)}
                          </span>
                        </div>
                      ) : null}
                    </div>

                    <h3 className="font-extrabold text-[15px] text-foreground line-clamp-2 leading-snug transition-colors duration-300">
                      {prog.title}
                    </h3>

                    <div className="flex flex-col gap-2 text-xs text-muted-foreground font-medium">
                      <span className="flex items-center w-full">
                        <Calendar className="h-3.5 w-3.5 mr-1.5 opacity-70" />
                        {new Date(prog.startTime).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                      <div className="flex items-center gap-4">
                        <span className="flex items-center"><Clock className="h-3.5 w-3.5 mr-1.5 opacity-70" /> {prog.duration || "2 hrs"}</span>
                        <span className="flex items-center"><MapPin className="h-3.5 w-3.5 mr-1.5 opacity-70" /> {prog.mode}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 mt-auto border-t border-black/5 dark:border-white/5">
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/60">Price</span>
                        <div className="text-xl font-black text-foreground">₹{price}</div>
                      </div>
                      <div className="flex items-center justify-center rounded-xl h-10 px-5 text-xs font-bold bg-[#0b0c01] text-white hover:bg-black transition-all">
                        View Details
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
