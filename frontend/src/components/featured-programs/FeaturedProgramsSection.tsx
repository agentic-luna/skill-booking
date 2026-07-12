import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ProgramCard from "@/components/common/ProgramCard";
import { MOCK_PROGRAMS } from "@/constants/mockData";

export default function FeaturedProgramsSection() {
  const featuredPrograms = MOCK_PROGRAMS.filter((p) => p.status === "approved").slice(0, 4);

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
          
          <Link href="/programs" className="group shrink-0">
            <div className="flex items-center justify-center px-6 py-2.5 bg-bone-white border border-clay-shadow rounded-full shadow-sm transition-all duration-300 hover:shadow hover:bg-white hover:-translate-y-0.5">
              <span className="text-sm font-semibold tracking-wide text-graphite-ink transition-colors">
                Explore All Classes
              </span>
              <div className="ml-2 rounded-full bg-charcoal-slate/5 p-1 group-hover:bg-charcoal-slate/10 transition-colors">
                <ArrowRight className="h-4 w-4 text-graphite-ink group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </Link>
        </div>

        {/* Program Cards Grid */}
        <div className="w-full">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredPrograms.map((prog) => (
              <ProgramCard key={prog.id} program={prog} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
