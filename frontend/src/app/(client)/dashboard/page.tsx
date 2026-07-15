"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, BookmarkCheck, Heart, Clock, Calendar, Sparkles, MapPin, PlayCircle, Library } from "lucide-react";
import { useAuthStore } from "@/features/auth/store/authStore";
import { useClientStore } from "@/features/client/store/clientStore";
import { useAlertStore } from "@/features/alerts/store/alertStore";
import { Button } from "@/components/ui/button";

export default function DashboardOverviewPage() {
  const router = useRouter();
  const showAlert = useAlertStore((s) => s.showAlert);
  const { user, isAuthenticated } = useAuthStore();
  const { 
    bookings, 
    fetchBookings, 
    events, 
    fetchEvents, 
    wishlist, 
    fetchWishlist 
  } = useClientStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    if (user?.role === "admin" || user?.role === "host") {
      router.push("/dashboard/profile");
      return;
    }
    fetchBookings();
    fetchEvents();
    fetchWishlist();
  }, [isAuthenticated, user, router, fetchBookings, fetchEvents, fetchWishlist]);

  if (!isAuthenticated || !user) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center p-4">
        <div className="animate-pulse flex flex-col items-center space-y-4">
          <div className="w-12 h-12 bg-primary/20 rounded-full" />
          <div className="h-4 w-32 bg-muted rounded-md" />
        </div>
      </div>
    );
  }

  const activeBookings = bookings.filter((b) => b.status === "CONFIRMED" || b.status === "PENDING");
  
  const bookedIds = bookings.map(b => b.eventId);
  const recommendations = events
    .filter(p => p.status === "APPROVED" && !bookedIds.includes(p.id))
    .slice(0, 3); // Fit 3 nicely in a grid

  const hoursLearned = bookings
    .filter((b) => b.status === "CONFIRMED")
    .reduce((sum, b) => sum + (b.event?.durationHours ?? 2.0), 0);

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-12">
      
      {/* ─── Top Bento Grid ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Dark Hero Card */}
        <div className="md:col-span-8 bg-[#0b0c01] rounded-[40px] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[300px]">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[radial-gradient(circle_at_100%_0%,_rgba(160,242,18,0.15),transparent)] pointer-events-none" />
          
          <div className="relative z-10 space-y-4 max-w-xl">
            <span className="inline-block bg-white/10 backdrop-blur-md text-white border border-white/20 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase">
              Welcome Back
            </span>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
              Hello, {user.name.split(" ")[0]}!
            </h1>
            <p className="text-white/60 text-base md:text-lg leading-relaxed max-w-md font-medium">
              Ready to develop your skill set? You have <strong className="text-white">{activeBookings.length}</strong> upcoming workshop{activeBookings.length === 1 ? "" : "s"} scheduled.
            </p>
          </div>

          <div className="relative z-10 pt-8 mt-auto">
            <Link href="/programs">
              <Button className="bg-[#a0f212] text-[#0b0c01] hover:bg-[#b0f533] rounded-2xl text-sm h-12 px-8 font-extrabold transition-all shadow-[0_0_20px_rgba(160,242,18,0.3)] hover:shadow-[0_0_30px_rgba(160,242,18,0.5)]">
                Browse New Skills
              </Button>
            </Link>
          </div>
        </div>

        {/* Active Tickets (Lime Green) */}
        <div className="md:col-span-4 bg-[#a0f212] rounded-[40px] p-8 text-[#0b0c01] shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[300px]">
          <div className="absolute -right-8 -top-8 text-black/5 transform rotate-12">
             <BookmarkCheck className="w-48 h-48" />
          </div>
          
          <div className="relative z-10">
             <div className="bg-[#0b0c01]/10 w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
               <BookmarkCheck className="h-6 w-6 text-[#0b0c01]" />
             </div>
             <p className="text-sm font-bold uppercase tracking-widest text-[#0b0c01]/70">Active Tickets</p>
          </div>

          <div className="relative z-10 mt-auto flex items-end justify-between">
            <h3 className="text-7xl font-black tracking-tighter leading-none">{activeBookings.length}</h3>
            <Link href="/dashboard/tickets" className="bg-[#0b0c01] text-white p-3 rounded-full hover:bg-black/80 transition-colors shadow-lg">
               <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>

        {/* Small Stat 1: Wishlist */}
        <div className="md:col-span-6 bg-white dark:bg-card rounded-[32px] border border-black/5 dark:border-white/5 p-8 shadow-sm flex items-center gap-6 group hover:shadow-md transition-shadow">
          <div className="h-16 w-16 bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center rounded-3xl shrink-0 group-hover:scale-110 transition-transform duration-300">
            <Heart className="h-7 w-7" />
          </div>
          <div>
            <h3 className="text-3xl font-black">{wishlist.length}</h3>
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mt-1">Saved in Wishlist</p>
          </div>
        </div>

        {/* Small Stat 2: Hours Learned */}
        <div className="md:col-span-6 bg-white dark:bg-card rounded-[32px] border border-black/5 dark:border-white/5 p-8 shadow-sm flex items-center gap-6 group hover:shadow-md transition-shadow">
          <div className="h-16 w-16 bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center rounded-3xl shrink-0 group-hover:scale-110 transition-transform duration-300">
            <Clock className="h-7 w-7" />
          </div>
          <div>
            <h3 className="text-3xl font-black">{hoursLearned}</h3>
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mt-1">Hours Learned</p>
          </div>
        </div>
      </div>

      {/* ─── Upcoming Bookings ─────────────────────────────────────────────────────── */}
      <div className="space-y-6 pt-4">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-3">
            <div className="bg-[#0b0c01] text-[#a0f212] p-2 rounded-xl"><Calendar className="h-5 w-5" /></div>
            Upcoming Bookings
          </h2>
          <Link href="/dashboard/tickets" className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider">
            View All Tickets
          </Link>
        </div>

        {activeBookings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeBookings.slice(0, 3).map((booking) => {
              const event = booking.event;
              if (!event) return null;
              const startTime = new Date(event.startTime);
              const formattedDate = startTime.toLocaleDateString();
              const formattedTime = startTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
              const location = event.mode === "ONLINE" ? "Online Stream" : (event.venueDetails as any)?.address || "Venue";
              const hostName = event.host?.user ? `${event.host.user.firstName} ${event.host.user.lastName}` : "Host";

              return (
                <div key={booking.id} className="bg-white dark:bg-card border border-black/5 dark:border-white/5 rounded-[32px] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={event.posterUrl || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=300"}
                      alt={event.title}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider text-[#0b0c01] shadow-lg">
                      {booking.status}
                    </div>
                  </div>
                  
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div className="space-y-4">
                      <h3 className="font-extrabold text-lg text-foreground leading-tight line-clamp-2">
                        {event.title}
                      </h3>
                      <div className="space-y-2.5">
                        <div className="flex items-center text-sm font-medium text-muted-foreground">
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center mr-3 shrink-0"><Calendar className="h-4 w-4" /></div>
                          {formattedDate} at {formattedTime}
                        </div>
                        <div className="flex items-center text-sm font-medium text-muted-foreground">
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center mr-3 shrink-0"><MapPin className="h-4 w-4" /></div>
                          <span className="truncate">{location}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 mt-4 border-t border-black/5 dark:border-white/5 space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#0b0c01] text-[#a0f212] flex items-center justify-center text-[10px] font-bold">
                          {hostName.charAt(0)}
                        </div>
                        <p className="text-xs font-semibold text-muted-foreground truncate">By {hostName}</p>
                      </div>
                      <Button 
                        className="w-full rounded-2xl h-12 text-sm font-bold bg-[#0b0c01] text-white hover:bg-[#1a1c02] shadow-lg"
                        onClick={() => showAlert("Room Launching", "Launching your live workshop room. Please allow your browser popup windows access.", "info")}
                      >
                        <PlayCircle className="mr-2 h-5 w-5" /> Enter Workshop
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center p-12 rounded-[40px] bg-white dark:bg-card border border-black/5 dark:border-white/5 flex flex-col items-center justify-center space-y-5 shadow-sm">
            <div className="bg-[#f4f5f0] dark:bg-muted/50 p-6 rounded-full">
              <Library className="h-12 w-12 text-muted-foreground opacity-50" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold">No Upcoming Workshops</h3>
              <p className="text-muted-foreground font-medium text-sm">Your schedule is completely clear.</p>
            </div>
            <Link href="/programs">
              <Button className="rounded-2xl px-8 h-12 font-bold shadow-sm mt-2 bg-[#0b0c01] text-white hover:bg-black/80">Browse Workshops</Button>
            </Link>
          </div>
        )}
      </div>

      {/* ─── Suggested for You ────────────────────────────────────────────────────── */}
      <div className="space-y-6 pt-6">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-3">
            <div className="bg-[#a0f212] text-[#0b0c01] p-2 rounded-xl"><Sparkles className="h-5 w-5" /></div>
            Suggested for You
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((prog) => (
            <div key={prog.id} className="bg-white dark:bg-card border border-black/5 dark:border-white/5 rounded-[32px] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group">
              <div className="relative h-48 overflow-hidden">
                <img
                  src={prog.posterUrl || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=300"}
                  alt={prog.title}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest bg-muted px-2.5 py-1 rounded-md">{prog.mode}</span>
                  </div>
                  <h3 className="font-extrabold text-lg text-foreground leading-tight line-clamp-2">
                    {prog.title}
                  </h3>
                </div>

                <div className="pt-6 mt-4 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
                  <div className="text-xl font-black text-[#0b0c01] dark:text-white">
                    ₹{prog.venueDetails?.price || "Free"}
                  </div>
                  <Link href={`/programs/${prog.id}`}>
                    <Button variant="outline" className="rounded-2xl h-10 px-5 text-xs font-bold border-black/10 hover:bg-black/5 dark:hover:bg-white/10">
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
          {recommendations.length === 0 && (
            <div className="col-span-full text-center py-16 rounded-[40px] font-medium text-muted-foreground bg-white dark:bg-card border border-black/5 dark:border-white/5 flex items-center justify-center">
              You have explored everything! No new recommendations left.
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
