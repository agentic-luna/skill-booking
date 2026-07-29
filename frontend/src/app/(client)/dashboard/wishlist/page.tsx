"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Star, Clock, MapPin, Trash2, Ticket, Calendar } from "lucide-react";

import BackButton from "@/components/common/BackButton";

import { useAuthStore } from "@/features/auth/store/authStore";
import { useClientStore } from "@/features/client/store/clientStore";
import Footer from "@/components/common/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ProgramCard from "@/components/common/ProgramCard";
import { Program } from "@/constants/mockData";

function mapEventToProgram(event: any): Program {
  const hostUser = event.host?.user;
  const instructorName = event.trainerName || (hostUser ? `${hostUser.firstName} ${hostUser.lastName}` : "Instructor");
  const instructorAvatar = hostUser?.avatarUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face";
  const locationStr = event.mode === "ONLINE" ? "Online" : (event.venueDetails?.district || event.venueDetails?.address || "In Person");
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
    date: event.startTime ? event.startTime.split("T")[0] : "2026-07-12",
    time: event.startTime 
      ? new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " EST"
      : "10:00 AM EST",
    spotsLeft: event.availableSeats ?? 0,
    maxSpots: event.totalSeats ?? 20,
    location: locationStr,
    imageUrl: imageUrlStr,
    status: event.status ? event.status.toLowerCase() : "approved",
    featured: true,
  };
}

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
      <main className="flex-1 pt-[104px] pb-8 bg-muted/10 dark:bg-card/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="space-y-1">
            <BackButton href="/" label="Back to feed" />
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
              <Heart className="h-6 w-6 text-red-500 fill-red-500" /> My Saved Events
            </h1>
            <p className="text-sm text-muted-foreground">Keep track of the classes you want to attend next.</p>
          </div>

          {wishlist.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlist.map((item) => {
                const prog = item.event;
                if (!prog) return null;
                const programData = mapEventToProgram(prog);

                return (
                  <div key={item.id} className="relative group">
                    {/* Remove Button overlay - placed outside the Link to avoid nested interactivity issues */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleRemoveFromWishlist(prog.id);
                      }}
                      className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 backdrop-blur-xs text-white p-2 rounded-full z-10 active:scale-90 transition-transform shadow-md"
                      title="Remove from saved list"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <ProgramCard program={programData} />
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
