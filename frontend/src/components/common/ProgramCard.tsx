import React from "react";
import Link from "next/link";
import { Clock, MapPin, Star } from "lucide-react";
import { Program } from "@/constants/mockData";

interface ProgramCardProps {
  program: Program;
}

export default function ProgramCard({ program }: ProgramCardProps) {
  const price = program.price || 0;
  
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
        
        {/* Premium Glass Badge */}
        <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-md border border-white/30 text-white text-[10px] px-3 py-1 rounded-full font-bold tracking-wide capitalize shadow-sm">
          {program.category || "General"}
        </div>
      </div>

      <div className="flex flex-col flex-1 p-6 gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="h-6 w-6 rounded-full bg-[#0b0c01] text-[#a0f212] flex items-center justify-center text-[8px] font-extrabold ring-2 ring-background shadow-sm">
              {program.instructorName.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase()}
            </div>
            <span className="text-xs font-semibold text-muted-foreground">{program.instructorName}</span>
          </div>
          <div className="flex items-center bg-amber-500/10 px-2 py-0.5 rounded-full">
            <Star className="h-3 w-3 fill-amber-500 text-amber-500 mr-1" />
            <span className="text-xs font-bold text-amber-700 dark:text-amber-500">{program.rating || 4.8}</span>
          </div>
        </div>

        <h3 className="font-extrabold text-[15px] text-foreground line-clamp-2 leading-snug transition-colors duration-300">
          {program.title}
        </h3>

        <div className="flex flex-wrap gap-y-2 text-xs text-muted-foreground font-medium">
          <span className="flex items-center w-1/2"><Clock className="h-3.5 w-3.5 mr-1.5 opacity-70" /> {program.duration || "2 hrs"}</span>
          <span className="flex items-center w-1/2"><MapPin className="h-3.5 w-3.5 mr-1.5 opacity-70" /> {program.location.split(",")[0]}</span>
        </div>

        <div className="flex items-center justify-between pt-4 mt-auto">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/60">Price</span>
            <div className="text-xl font-black text-foreground">₹{price}</div>
          </div>
          <div className="flex items-center justify-center rounded-xl h-10 px-5 text-xs font-bold bg-gradient-to-r from-[#1b2b0a] to-[#2a420f] border border-[#a0f212]/30 text-[#a0f212] shadow-[0_0_15px_rgba(160,242,18,0.15)] group-hover:from-[#a0f212] group-hover:to-[#8ce20b] group-hover:text-[#0b0c01] group-hover:shadow-[0_0_25px_rgba(160,242,18,0.4)] transition-all duration-300">
            View Details
          </div>
        </div>
      </div>
    </Link>
  );
}
