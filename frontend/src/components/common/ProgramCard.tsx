import React from "react";
import Link from "next/link";
import { Clock, MapPin, Star, Flame, Zap, Calendar } from "lucide-react";
import { Program } from "@/constants/mockData";
import { calculateBookedSeats } from "@/lib/utils";

interface ProgramCardProps {
  program: Program;
}

export default function ProgramCard({ program }: ProgramCardProps) {
  const price = program.price || 0;
  const spotsLeft = program.spotsLeft ?? 0;
  const maxSpots = program.maxSpots ?? 0;
  const bookedSeats = calculateBookedSeats(maxSpots, spotsLeft);

  return (
    <Link
      href={`/programs/${program.id}`}
      className="group flex flex-col bg-white border border-border/20 rounded-3xl overflow-hidden shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-1 relative cursor-pointer"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted/20">
        <img
          src={program.imageUrl || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80"}
          alt={program.title}
          className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700 ease-out"
        />
        {/* Elegant Glassmorphic Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        {/* Top Badges Container */}
        <div className="absolute top-4 inset-x-4 flex justify-between items-start gap-2 z-10 flex-wrap">
          <div className="flex gap-2 flex-wrap">
            <div className="bg-white/20 backdrop-blur-md border border-white/30 text-white text-[10px] px-3 py-1 rounded-full font-bold tracking-wide capitalize shadow-sm">
              {program.category || "General"}
            </div>
            {program.isBoosted && (
              <div className="bg-[#a0f212] text-[#0b0c01] text-[9px] px-3 py-1 rounded-full font-black tracking-widest uppercase shadow-[0_0_12px_rgba(160,242,18,0.4)] flex items-center gap-1 shrink-0">
                <span>★</span> {program.boostTier === 'PRO' ? 'ULTRA PRO' : program.boostTier === 'STANDARD' ? 'PRO BOOST' : 'FEATURED'}
              </div>
            )}
          </div>

          {/* Scarcity Tension Badge */}
          <div className="shrink-0">
            {spotsLeft <= 0 ? (
              <span className="inline-flex items-center bg-red-600 border border-red-500/30 text-white text-[9px] px-2.5 py-1 rounded-full font-black uppercase tracking-wider shadow-sm gap-1">
                Sold Out
              </span>
            ) : spotsLeft <= 5 ? (
              <span className="inline-flex items-center bg-orange-600 border border-orange-500/30 text-white text-[9px] px-2.5 py-1 rounded-full font-black uppercase tracking-wider shadow-sm gap-1 animate-pulse">
                <Flame className="h-3 w-3 fill-white" /> Only {spotsLeft} left!
              </span>
            ) : (
              <span className="inline-flex items-center bg-[#0d1e17] border border-emerald-500/30 text-[#a0f212] text-[9px] px-2.5 py-1 rounded-full font-black uppercase tracking-wider shadow-sm gap-1">
                <Zap className="h-3 w-3 fill-[#a0f212]" /> {spotsLeft} slots left
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col flex-1 p-6 gap-4 min-w-0">
        <div className="flex items-center justify-between gap-2 min-w-0">
          <div className="flex items-center space-x-2 mr-auto min-w-0">
            <div className="h-6 w-6 rounded-full bg-muted text-foreground border border-border/50 flex items-center justify-center text-[8px] font-extrabold shadow-sm shrink-0">
              {program.instructorName ? program.instructorName.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase() : "IN"}
            </div>
            <span className="text-xs font-semibold text-muted-foreground truncate">{program.instructorName}</span>
            {program.hasFeaturedOrganizerBadge && (
              <span className="bg-[#a0f212]/20 border border-[#a0f212]/40 text-emerald-800 dark:text-[#a0f212] text-[8px] px-1.5 py-0.5 rounded-full font-black uppercase shrink-0">
                PRO HOST
              </span>
            )}
          </div>
          {program.rating && program.rating >= 2 ? (
            <div className="flex items-center bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full shrink-0">
              <Star className="h-3 w-3 fill-amber-500 text-amber-500 mr-1" />
              <span className="text-xs font-bold text-amber-700 dark:text-amber-500">
                {program.rating.toFixed(1)}
                {program.reviewsCount ? ` (${program.reviewsCount})` : ""}
              </span>
            </div>
          ) : null}
        </div>

        <h3 className="font-extrabold text-[15px] text-foreground line-clamp-2 leading-snug transition-colors duration-300 min-h-[40px]">
          {program.title}
        </h3>

        <div className="flex flex-col gap-2 text-xs text-muted-foreground font-medium border-b border-border/30 pb-2 min-w-0">
          {program.date && (
            <span className="flex items-center w-full truncate">
              <Calendar className="h-3.5 w-3.5 mr-1.5 opacity-70 shrink-0" />
              <span className="truncate">{program.date} {program.time ? `• ${program.time}` : ""}</span>
            </span>
          )}
          <div className="flex items-center gap-4 min-w-0">
            <span className="flex items-center shrink-0"><Clock className="h-3.5 w-3.5 mr-1.5 opacity-70 shrink-0" /> {program.duration || "2 hrs"}</span>
            <span className="flex items-center min-w-0 truncate"><MapPin className="h-3.5 w-3.5 mr-1.5 opacity-70 shrink-0" /> <span className="truncate">{program.location.split(",")[0]}</span></span>
          </div>
        </div>

        {/* Live Enrollment Tension Counter */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground font-medium">Capacity Booked:</span>
          <span className="font-bold text-foreground">{bookedSeats} / {maxSpots} slots taken</span>
        </div>

        <div className="flex items-center justify-between pt-2 mt-auto">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/60">Price</span>
            <div className="text-xl font-black text-foreground">₹{price}</div>
          </div>
          <div className="flex items-center justify-center rounded-xl h-10 px-5 text-xs font-bold border border-border bg-transparent text-foreground group-hover:bg-foreground group-hover:text-background transition-all duration-300 shadow-sm">
            View Details
          </div>
        </div>
      </div>
    </Link>
  );
}
