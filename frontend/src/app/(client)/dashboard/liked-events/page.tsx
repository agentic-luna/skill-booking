"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, ArrowLeft, Star, MapPin, Calendar, BookOpen } from "lucide-react";

import { useAuthStore } from "@/features/auth/store/authStore";
import { useClientStore } from "@/features/client/store/clientStore";
import { useAlertStore } from "@/features/alerts/store/alertStore";
import Footer from "@/components/common/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function LikedEventsPage() {
  const router = useRouter();
  const showAlert = useAlertStore((s) => s.showAlert);
  const { isAuthenticated } = useAuthStore();
  const { likedEvents, fetchLikedEvents, toggleLike, loading } = useClientStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    fetchLikedEvents();
  }, [isAuthenticated, router, fetchLikedEvents]);

  const handleUnlike = async (eventId: string) => {
    try {
      await toggleLike(eventId);
      showAlert("Unliked Workshop", "Removed from your liked workshops collection.", "info");
    } catch (err: any) {
      showAlert("Error", err.message || "Failed to unlike event.", "destructive");
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 bg-muted/10 dark:bg-card/5 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Link href="/programs">
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </Link>
                <h1 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
                  <Heart className="h-6 w-6 text-rose-500 fill-rose-500" /> Liked Workshops
                </h1>
              </div>
              <p className="text-sm text-muted-foreground ml-10">Manage and browse the coaching sessions you liked.</p>
            </div>
          </div>

          {loading && likedEvents.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-64 rounded-2xl bg-card border border-border/40 animate-pulse" />
              ))}
            </div>
          ) : likedEvents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
              {likedEvents.map((event) => {
                const price = Number(event.venueDetails?.price || 0);
                const formattedDate = new Date(event.startTime).toLocaleDateString();
                const instructorName = event.host?.user ? `${event.host.user.firstName} ${event.host.user.lastName}` : "Platform Host";

                return (
                  <div
                    key={event.id}
                    className="group flex flex-col border border-border/40 bg-card rounded-2xl overflow-hidden hover:border-primary/20 animate-hover relative"
                  >
                    <button
                      onClick={() => handleUnlike(event.id)}
                      className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-xs transition-colors"
                    >
                      <Heart className="h-4.5 w-4.5 fill-rose-500 text-rose-500" />
                    </button>

                    <div className="relative aspect-video w-full bg-muted">
                      <img
                        src={event.posterUrl || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=300"}
                        alt={event.title}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>

                    <div className="flex flex-col flex-1 p-5 space-y-3">
                      <div className="flex items-center space-x-2">
                        <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-[9px] font-bold text-primary">
                          {instructorName.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="text-[10px] text-muted-foreground">{instructorName}</span>
                      </div>

                      <h3 className="font-bold text-sm text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                        {event.title}
                      </h3>

                      <div className="flex items-center space-x-2 text-[10px] text-muted-foreground">
                        <span className="flex items-center"><Calendar className="h-3 w-3 mr-1" /> {formattedDate}</span>
                        <span>•</span>
                        <span className="flex items-center"><MapPin className="h-3 w-3 mr-1" /> {event.mode}</span>
                      </div>

                      <div className="flex items-center space-x-1">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        <span className="text-xs font-semibold text-foreground">4.8</span>
                        <span className="text-[10px] text-muted-foreground">({event.availableSeats} spots left)</span>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-border/40 mt-auto">
                        <div>
                          <span className="text-[10px] text-muted-foreground">Price</span>
                          <div className="text-base font-extrabold text-foreground">${price}</div>
                        </div>
                        <Link href={`/programs/${event.id}`}>
                          <Button size="sm" className="rounded-lg h-8 text-xs">View Details</Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center bg-card border border-border/40 rounded-2xl shadow-xs space-y-4 pt-16">
              <div className="p-4 bg-muted/60 dark:bg-muted/30 rounded-full text-muted-foreground">
                <BookOpen className="h-8 w-8" />
              </div>
              <div className="space-y-1.5 max-w-sm">
                <h3 className="text-lg font-bold text-foreground">No liked workshops</h3>
                <p className="text-xs text-muted-foreground">Explore skill workshops on BookMySkill and hit the heart icon to save them here.</p>
              </div>
              <Link href="/programs">
                <Button className="rounded-xl text-xs h-9">
                  Explore Programs
                </Button>
              </Link>
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
