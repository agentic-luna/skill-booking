"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Star, Clock, MapPin, Trash2, ArrowLeft, Ticket, Calendar } from "lucide-react";

import { useAuthStore } from "@/features/auth/store/authStore";
import { useClientStore } from "@/features/client/store/clientStore";
import Footer from "@/components/common/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function WishlistPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const { wishlist, fetchWishlist, removeFromWishlist, loading } = useClientStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    if (user?.role === "admin" || user?.role === "host") {
      router.push("/dashboard/profile");
      return;
    }
    fetchWishlist();
  }, [isAuthenticated, user, router, fetchWishlist]);

  if (!isAuthenticated || user?.role === "admin" || user?.role === "host") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="animate-pulse flex flex-col items-center space-y-4">
          <div className="w-12 h-12 bg-primary/20 rounded-full" />
          <div className="h-4 w-32 bg-muted rounded-md" />
        </div>
      </div>
    );
  }

  const handleRemoveFromWishlist = async (eventId: string) => {
    try {
      await removeFromWishlist(eventId);
    } catch (err) {
      // error is logged in store
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 bg-muted/10 dark:bg-card/5 py-8">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-6">
          
          <div className="space-y-1">
            <Link href="/home" className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground gap-1 pb-1 font-semibold">
              <ArrowLeft className="h-3 w-3" /> Back to feed
            </Link>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
              <Heart className="h-6 w-6 text-red-500 fill-red-500" /> My Saved Skills
            </h1>
            <p className="text-sm text-muted-foreground">Keep track of the classes you want to attend next.</p>
          </div>

          {wishlist.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {wishlist.map((item) => {
                const prog = item.event;
                if (!prog) return null;
                const instructorName = prog.host?.user ? `${prog.host.user.firstName} ${prog.host.user.lastName}` : "Platform Host";
                const price = Number(prog.venueDetails?.price || 0);
                const formattedDate = new Date(prog.startTime).toLocaleDateString();

                return (
                  <div
                    key={item.id}
                    className="group flex flex-col border border-border/40 bg-card rounded-2xl overflow-hidden hover:border-primary/20 animate-hover relative"
                  >
                    {/* Remove Button overlay */}
                    <button
                      onClick={() => handleRemoveFromWishlist(prog.id)}
                      className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 backdrop-blur-xs text-white p-2 rounded-full z-15 active:scale-90 transition-transform"
                      title="Remove from saved list"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>

                    <div className="relative aspect-video w-full bg-muted">
                      <img
                        src={prog.posterUrl || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=300"}
                        alt={prog.title}
                        className="object-cover w-full h-full group-hover:scale-103 transition-transform duration-300"
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
                        {prog.title}
                      </h3>

                      <div className="flex items-center space-x-2 text-[10px] text-muted-foreground">
                        <span className="flex items-center"><Calendar className="h-3 w-3 mr-1" /> {formattedDate}</span>
                        <span>•</span>
                        <span className="flex items-center"><MapPin className="h-3 w-3 mr-1" /> {prog.mode}</span>
                      </div>

                      <div className="flex items-center space-x-1.5">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        <span className="text-xs font-semibold text-foreground">4.8</span>
                        <span className="text-[10px] text-muted-foreground">({prog.availableSeats} left)</span>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-border/40 mt-auto">
                        <div>
                          <span className="text-[10px] text-muted-foreground">Fee</span>
                          <div className="text-base font-extrabold text-foreground">${price}</div>
                        </div>
                        <Link href={`/programs/${prog.id}`}>
                          <Button size="sm" className="rounded-lg h-8 text-xs">Book Seat</Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center p-12 border rounded-3xl bg-muted/20 border-dashed border-border/60 flex flex-col items-center justify-center space-y-5 min-h-[300px]">
              <div className="bg-muted p-4 rounded-full shadow-sm border border-black/5 dark:border-white/5">
                <Heart className="h-8 w-8 text-muted-foreground opacity-50" />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-extrabold text-lg text-foreground">Wishlist is empty</h3>
                <p className="text-sm font-medium text-muted-foreground max-w-sm mx-auto leading-relaxed">
                  You haven&apos;t saved any courses yet. Save them while exploring to keep track here.
                </p>
              </div>
              <div className="pt-3">
                <Link href="/programs">
                  <Button className="rounded-xl px-8 h-11 font-bold shadow-sm bg-[#0b0c01] text-white hover:bg-[#0b0c01]/90 dark:bg-[#a0f212] dark:text-[#0b0c01] dark:hover:bg-[#abf282]">
                    Explore Classes
                  </Button>
                </Link>
              </div>
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
