"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ProgramCard from "@/components/common/ProgramCard";
import { Program } from "@/constants/mockData";
import { useClientStore } from "@/features/client/store/clientStore";

function mapEventToProgram(event: any): Program {
  const hostUser = event.host?.user;
  const instructorName = event.trainerName || (hostUser ? `${hostUser.firstName} ${hostUser.lastName}` : "Instructor");
  const instructorAvatar = hostUser?.avatarUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face";
  const locationStr = event.mode === "ONLINE" ? "Online" : (event.venueDetails?.address || "In Person");
  const imageUrlStr = event.posterUrl || event.images?.[0] || "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=600";

  return {
    id: event.id,
    title: event.title,
    description: event.description || "",
    instructorName,
    instructorAvatar,
    category: event.category || "technology",
    rating: 4.8,
    reviewsCount: event._count?.bookings || 12,
    price: event.price || 0,
    duration: event.duration || "2 hours",
    date: (() => {
      if (!event.startTime) return "2026-07-12";
      const startStr = event.startTime.split("T")[0];
      const endDateVal = (event.venueDetails as any)?.endDate;
      if (endDateVal && endDateVal !== startStr) {
        return `${startStr} to ${endDateVal}`;
      }
      return startStr;
    })(),
    time: event.startTime 
      ? new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " EST"
      : "10:00 AM EST",
    spotsLeft: event.availableSeats ?? 0,
    maxSpots: event.totalSeats ?? 20,
    location: locationStr,
    imageUrl: imageUrlStr,
    status: event.status ? event.status.toLowerCase() : "approved",
    featured: true,
    isBoosted: event.boostedEvent?.status === 'ACTIVE' && event.boostedEvent?.isActive && ['BASIC', 'PRO'].includes(event.boostedEvent?.tier),
  };
}

export default function FeaturedProgramsSection() {
  const { events, fetchEvents } = useClientStore();

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const now = new Date();
  const featuredPrograms = (events || [])
    .filter((p) => p.status === "APPROVED")
    .sort((a, b) => {
      const isBasicOrProBoosted = (e: any) =>
        e.boostedEvent?.isActive === true &&
        ['BASIC', 'PRO'].includes(e.boostedEvent?.tier) &&
        new Date(e.boostedEvent?.endDate) >= now;
      const aBoosted = isBasicOrProBoosted(a);
      const bBoosted = isBasicOrProBoosted(b);
      if (aBoosted && !bBoosted) return -1;
      if (!aBoosted && bBoosted) return 1;
      return 0;
    })
    .map(mapEventToProgram)
    .slice(0, 4);

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
          {featuredPrograms.length === 0 ? (
            <div className="text-center py-10 text-stone-grey">
              No featured masterclasses available right now.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featuredPrograms.map((prog) => (
                <ProgramCard key={prog.id} program={prog} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
