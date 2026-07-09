import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ProgramCard from "@/components/common/ProgramCard";
import { MOCK_PROGRAMS } from "@/constants/mockData";

export default function FeaturedProgramsSection() {
  const featuredPrograms = MOCK_PROGRAMS.filter((p) => p.status === "approved").slice(0, 8);

  return (
    <section id="featured-programs" className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight text-graphite-ink">
              Featured Skill Masterclasses
            </h2>
            <p className="text-stone-grey text-sm">
              Reserve your spot in high-demand workshops starting this week.
            </p>
          </div>
        </div>

        {/* Program Cards Grid */}
        <div className="relative w-full rounded-2xl overflow-hidden">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 max-h-[580px]">
            {featuredPrograms.map((prog) => (
              <ProgramCard key={prog.id} program={prog} />
            ))}
          </div>

          {/* Gradient Overlay & Explore Button */}
          <div className="absolute bottom-0 left-0 w-full h-[320px] bg-gradient-to-t from-linen-canvas via-linen-canvas/95 to-transparent flex flex-col items-center justify-end pb-8">
            <Link href="/programs" className="group">
              <div className="relative flex items-center justify-center px-8 py-4 bg-bone-white/80 backdrop-blur-xl border border-clay-shadow/40 rounded-full shadow-lg transition-all duration-300 hover:shadow-xl hover:bg-white hover:-translate-y-1">
                <span className="text-base font-semibold tracking-wide text-graphite-ink group-hover:text-nightshade-black transition-colors">
                  Explore All Classes
                </span>
                <div className="ml-3 rounded-full bg-charcoal-slate/5 p-1.5 group-hover:bg-charcoal-slate/10 transition-colors">
                  <ArrowRight className="h-4 w-4 text-graphite-ink group-hover:text-nightshade-black group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
