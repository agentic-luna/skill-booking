"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, BookmarkCheck, Heart, Clock, Calendar, Sparkles, MapPin, PlayCircle } from "lucide-react";
import { useAuthStore } from "@/features/auth/store/authStore";
import { useClientStore } from "@/features/client/store/clientStore";
import { useAlertStore } from "@/features/alerts/store/alertStore";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function DashboardOverviewPage() {
  const router = useRouter();
  const showAlert = useAlertStore((s) => s.showAlert);
  const { user, isAuthenticated } = useAuthStore();
  const { bookings, fetchBookings, events, fetchEvents } = useClientStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    if (user?.role === "admin") {
      router.push("/dashboard/profile");
      return;
    }
    fetchBookings();
    fetchEvents();
  }, [isAuthenticated, user, router, fetchBookings, fetchEvents]);

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
    .slice(0, 4);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header Greeting Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-[#0b0c01] text-white p-8 sm:p-10 shadow-xl border border-black/10 dark:border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_90%_20%,_rgba(160,242,18,0.15),transparent)] pointer-events-none" />
        <div className="relative z-10 max-w-xl space-y-4">
          <span className="bg-[#a0f212]/20 text-[#a0f212] px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase">
            Client Dashboard
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Hello, {user.name.split(" ")[0]}!
          </h1>
          <p className="text-white/80 text-sm md:text-base leading-relaxed max-w-md">
            Ready to develop your skill set? You have <strong className="text-white">{activeBookings.length}</strong> upcoming workshop{activeBookings.length === 1 ? "" : "s"} scheduled.
          </p>
          <div className="pt-2">
            <Link href="/programs">
              <Button className="bg-[#a0f212] text-[#0b0c01] hover:bg-[#a0f212]/90 rounded-xl text-sm h-10 px-6 font-bold transition-all shadow-lg shadow-[#a0f212]/20">
                Browse New Skills
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-muted/30 border border-black/5 dark:border-white/5 rounded-2xl p-6 flex flex-col gap-3 transition-colors hover:bg-muted/50">
          <div className="h-10 w-10 bg-[#a0f212]/20 text-[#0b0c01] dark:text-[#a0f212] flex items-center justify-center rounded-xl">
            <BookmarkCheck className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-2xl font-bold">{activeBookings.length}</h3>
            <p className="text-sm font-semibold text-muted-foreground">Active Tickets</p>
          </div>
        </div>

        <div className="bg-muted/30 border border-black/5 dark:border-white/5 rounded-2xl p-6 flex flex-col gap-3 transition-colors hover:bg-muted/50">
          <div className="h-10 w-10 bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center rounded-xl">
            <Heart className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-2xl font-bold">--</h3>
            <p className="text-sm font-semibold text-muted-foreground">Saved in Wishlist</p>
          </div>
        </div>

        <div className="bg-muted/30 border border-black/5 dark:border-white/5 rounded-2xl p-6 flex flex-col gap-3 transition-colors hover:bg-muted/50">
          <div className="h-10 w-10 bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center rounded-xl">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-2xl font-bold">--</h3>
            <p className="text-sm font-semibold text-muted-foreground">Hours Learned</p>
          </div>
        </div>
      </div>

      {/* Quick Actions removed since they are redundant with the new banner */}


      <div className="flex flex-col gap-12 pt-4 w-full">
        
        {/* Top Section: Upcoming Classes & Tickets */}
        <div className="space-y-6 w-full">
          <div className="flex items-center justify-between gap-4 w-full border-b border-black/5 dark:border-white/5 pb-3">
            <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2 shrink-0">
              <Calendar className="h-5 w-5 text-primary" /> Upcoming Bookings
            </h2>
            <Link href="/dashboard/tickets" className="text-sm font-semibold text-primary hover:underline shrink-0 text-right transition-colors">
              View All Tickets
            </Link>
          </div>

          {activeBookings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeBookings.slice(0, 3).map((booking) => {
                const event = booking.event;
                if (!event) return null;
                const startTime = new Date(event.startTime);
                const formattedDate = startTime.toLocaleDateString();
                const formattedTime = startTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                const location = event.mode === "ONLINE" ? "Online Stream" : (event.venueDetails as any)?.address || "Venue";
                const hostName = event.host?.user ? `${event.host.user.firstName} ${event.host.user.lastName}` : "Host";

                return (
                  <Card key={booking.id} className="overflow-hidden border-border/40 rounded-3xl shadow-sm hover:shadow-md transition-shadow duration-300">
                    <div className="flex flex-col h-full">
                      <div className="w-full aspect-video bg-muted relative shrink-0">
                        <img
                          src={event.posterUrl || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=300"}
                          alt={event.title}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div className="p-5 space-y-4 flex-1 flex flex-col justify-between bg-card">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[#0b0c01] bg-[#a0f212] px-2.5 py-1 rounded-md uppercase tracking-wide">
                              {booking.status}
                            </span>
                            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">ID: {booking.id.slice(0, 8)}</span>
                          </div>
                          
                          <h3 className="font-bold text-base text-foreground leading-snug line-clamp-2">
                            {event.title}
                          </h3>

                          <div className="flex flex-col gap-2 text-sm text-muted-foreground pt-1 font-medium">
                            <span className="flex items-center"><Calendar className="h-4 w-4 mr-2 shrink-0 text-foreground/70" /> {formattedDate}</span>
                            <span className="flex items-center"><Clock className="h-4 w-4 mr-2 shrink-0 text-foreground/70" /> {formattedTime}</span>
                            <span className="flex items-center"><MapPin className="h-4 w-4 mr-2 shrink-0 text-foreground/70" /> <span className="truncate">{location}</span></span>
                          </div>
                        </div>

                        <div className="border-t border-border/40 pt-4 mt-2 space-y-3">
                          <div className="text-xs text-muted-foreground truncate">Hosted by <span className="font-semibold text-foreground">{hostName}</span></div>
                          <Button size="sm" className="rounded-xl w-full h-10 text-sm font-bold shadow-sm" onClick={() => showAlert("Room Launching", "Launching your live workshop room. Please allow your browser popup windows access.", "info")}>
                            <PlayCircle className="mr-2 h-4 w-4" /> Enter Workshop
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center p-8 border rounded-3xl bg-muted/20 border-dashed border-border/60 flex flex-col items-center justify-center space-y-4 min-h-[250px]">
              <div className="bg-muted p-4 rounded-full mb-2 shadow-sm border border-black/5 dark:border-white/5">
                <Calendar className="h-8 w-8 text-muted-foreground opacity-50" />
              </div>
              <p className="text-muted-foreground text-sm font-medium">No upcoming workshops scheduled right now.</p>
              <Link href="/programs">
                <Button className="rounded-xl px-8 h-11 font-bold shadow-sm">Browse Workshops</Button>
              </Link>
            </div>
          )}
        </div>

        {/* Bottom Section: Recommended */}
        <div className="space-y-6 w-full">
          <div className="flex items-center justify-between gap-4 w-full border-b border-black/5 dark:border-white/5 pb-3">
            <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2 shrink-0">
              <Sparkles className="h-5 w-5 text-primary" /> Suggested for You
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map((prog) => (
              <Card key={prog.id} className="overflow-hidden border-border/40 rounded-3xl flex flex-col shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="aspect-video w-full relative bg-muted shrink-0">
                  <img
                    src={prog.posterUrl || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=300"}
                    alt={prog.title}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="p-5 space-y-4 flex-1 flex flex-col justify-between bg-card">
                  <div>
                    <h3 className="font-bold text-base text-foreground line-clamp-2 leading-snug">
                      {prog.title}
                    </h3>
                    
                    <div className="flex items-center justify-between pt-3 mt-1">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{prog.mode}</span>
                      <div className="text-base font-extrabold text-[#a0f212] bg-[#0b0c01] px-3 py-1 rounded-lg shadow-sm">${prog.venueDetails?.price || "Free"}</div>
                    </div>
                  </div>

                  <Link href={`/programs/${prog.id}`}>
                    <Button className="w-full h-10 text-sm font-bold rounded-xl mt-3 shadow-sm border border-black/5 hover:bg-black/5 dark:hover:bg-white/10" variant="secondary">
                      View Details <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
            {recommendations.length === 0 && (
              <div className="text-center py-16 border border-dashed rounded-3xl text-sm font-medium text-muted-foreground sm:col-span-2 lg:col-span-3 bg-muted/20 w-full min-h-[250px] flex items-center justify-center">
                You have explored everything! No new recommendations left.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
