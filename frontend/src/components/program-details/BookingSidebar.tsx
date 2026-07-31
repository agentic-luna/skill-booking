import React from "react";
import { Calendar, Clock, Ticket, MapPin, Share2, Heart, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Program } from "@/constants/mockData";

interface BookingSidebarProps {
  program: Program;
  user: any; // Or your specific User type
  isWishlisted: boolean;
  onBookClick: () => void;
  onWishlistToggle: () => void;
  onShareClick: () => void;
}

export default function BookingSidebar({
  program,
  user,
  isWishlisted,
  onBookClick,
  onWishlistToggle,
  onShareClick,
}: BookingSidebarProps) {
  const maxSpots = program.maxSpots || 10;
  const spotsLeft = program.spotsLeft ?? 0;
  const bookedSeats = Math.max(0, maxSpots - spotsLeft);
  const fillPercentage = maxSpots > 0 ? Math.round((bookedSeats / maxSpots) * 100) : 0;
  const isFinished =
    program.status?.toLowerCase() === "completed" ||
    program.status?.toLowerCase() === "finished" ||
    program.status?.toLowerCase() === "cancelled" ||
    program.status?.toLowerCase() === "canceled" ||
    (program.startTime ? new Date(program.startTime) < new Date() : false);

  return (
    <div className="sticky top-24 bg-card border border-border/40 rounded-2xl p-6 shadow-md space-y-6">
      <div className="flex justify-between items-end border-b pb-4">
        <div>
          <span className="text-xs text-muted-foreground">Registration Fee</span>
          <div className="text-2xl font-extrabold text-foreground">₹{program.price}</div>
        </div>
        <div className="text-right">
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
              isFinished
                ? "bg-destructive/10 text-destructive"
                : spotsLeft <= 5
                  ? "bg-destructive/10 text-destructive"
                  : "bg-emerald-500/10 text-emerald-600"
            }`}
          >
            {isFinished ? "Unavailable" : spotsLeft === 0 ? "Fully Booked" : `${spotsLeft} spots left`}
          </span>
        </div>
      </div>

      {/* Scarcity / Tension Creation Card */}
      <div className="space-y-3">
        {isFinished ? (
          <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-3 flex gap-2.5 items-start text-destructive text-xs font-semibold">
            <span className="text-base leading-none">⚠️</span>
            <div className="space-y-0.5 w-full">
              <p className="font-extrabold text-foreground leading-none">Workshop Concluded</p>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                This event has already finished and is no longer accepting registrations.
              </p>
            </div>
          </div>
        ) : spotsLeft === 0 ? (
          <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-3 flex gap-2.5 items-start text-red-700 dark:text-red-400 text-xs font-semibold">
            <span className="text-base leading-none">🚫</span>
            <div className="space-y-0.5 w-full">
              <p className="font-extrabold text-foreground leading-none">Registration Closed</p>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                All seats are booked. Wishlist the workshop to get alerted on cancellations.
              </p>
            </div>
          </div>
        ) : spotsLeft <= 5 ? (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex flex-col gap-2 text-amber-700 dark:text-amber-400 text-xs font-semibold animate-pulse">
            <div className="flex gap-2.5 items-start">
              <span className="text-base leading-none">🔥</span>
              <div className="space-y-0.5">
                <p className="font-extrabold text-amber-800 dark:text-amber-300 leading-none">
                  Extremely Limited Seats!
                </p>
                <p className="text-[10px] text-amber-700/80 dark:text-amber-400/80 leading-relaxed">
                  Only {spotsLeft} of {maxSpots} spots remaining. Complete payment now to guarantee your registration.
                </p>
              </div>
            </div>
            {/* Visual Progress Bar */}
            <div className="space-y-1 pt-1 border-t border-amber-500/10">
              <div className="flex justify-between text-[9px] text-amber-800/60 dark:text-amber-400/60 font-bold uppercase tracking-wider">
                <span>Seats Taken</span>
                <span>{fillPercentage}%</span>
              </div>
              <div className="h-1.5 w-full bg-amber-500/10 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${fillPercentage}%` }} />
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex flex-col gap-2 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
            <div className="flex gap-2.5 items-start">
              <span className="text-base leading-none">⚡</span>
              <div className="space-y-0.5">
                <p className="font-extrabold text-emerald-800 dark:text-emerald-300 leading-none">
                  High Demand Event
                </p>
                <p className="text-[10px] text-emerald-700/80 dark:text-emerald-400/80 leading-relaxed">
                  {bookedSeats} of {maxSpots} slots are taken. Secure your reservation before registration closes.
                </p>
              </div>
            </div>
            {/* Visual Progress Bar */}
            <div className="space-y-1 pt-1 border-t border-emerald-500/10">
              <div className="flex justify-between text-[9px] text-emerald-800/60 dark:text-amber-400/60 font-bold uppercase tracking-wider">
                <span>Seats Taken</span>
                <span>{fillPercentage}%</span>
              </div>
              <div className="h-1.5 w-full bg-emerald-500/10 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${fillPercentage}%` }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Booking Info Grid */}
      <div className="space-y-4 text-xs text-muted-foreground">
        <div className="flex items-center">
          <Calendar className="h-4.5 w-4.5 text-foreground mr-3 shrink-0" />
          <div>
            <div className="font-bold text-foreground">Date</div>
            <div>{program.date}</div>
          </div>
        </div>
        <div className="flex items-center">
          <Clock className="h-4.5 w-4.5 text-foreground mr-3 shrink-0" />
          <div>
            <div className="font-bold text-foreground">Schedule Time & Duration</div>
            <div>
              {program.time} • <span className="font-semibold text-foreground">{program.duration}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center">
          <Ticket className="h-4.5 w-4.5 text-foreground mr-3 shrink-0" />
          <div>
            <div className="font-bold text-foreground">Total Capacity</div>
            <div>
              {maxSpots} seats cap ({spotsLeft} available)
            </div>
          </div>
        </div>
        <div className="flex items-center">
          <MapPin className="h-4.5 w-4.5 text-foreground mr-3 shrink-0" />
          <div>
            <div className="font-bold text-foreground">Location Venue</div>
            <div className="text-foreground leading-relaxed break-words">{program.location}</div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 pt-2">
        {isFinished ? (
          <div className="space-y-2.5">
            <div className="text-center p-3.5 bg-destructive/10 dark:bg-destructive/5 rounded-xl border border-destructive/25 text-sm text-destructive font-extrabold shadow-sm">
              Currently Unavailable
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                className="rounded-xl h-10 text-xs text-foreground border-border/60 hover:bg-muted/50 transition-colors shadow-sm"
                onClick={onWishlistToggle}
              >
                <Heart
                  className={`mr-1.5 h-4 w-4 ${
                    isWishlisted ? "fill-red-500 text-red-500" : ""
                  }`}
                />
                {isWishlisted ? "Wishlisted" : "Wishlist"}
              </Button>
              <Button
                variant="outline"
                className="rounded-xl h-10 text-xs text-foreground border-border/60 hover:bg-muted/50 transition-colors shadow-sm"
                onClick={onShareClick}
              >
                <Share2 className="mr-1.5 h-4 w-4" /> Share Event
              </Button>
            </div>
          </div>
        ) : user?.role === "host" || user?.role === "admin" ? (
          <div className="space-y-2.5">
            <div className="text-center p-3 bg-muted/30 rounded-xl border text-[11px] text-muted-foreground font-bold">
              Booking disabled for {user.role === "admin" ? "Admin" : "Host"} accounts
            </div>
            <Button
              variant="outline"
              className="w-full rounded-xl h-11 text-xs text-foreground border-border/60 hover:bg-muted/50 transition-colors shadow-sm"
              onClick={onShareClick}
            >
              <Share2 className="mr-1.5 h-4 w-4" /> Share Event
            </Button>
          </div>
        ) : (
          <>
            <Button
              className="w-full rounded-xl py-6 text-sm font-semibold shadow-md shadow-primary/10"
              disabled={spotsLeft === 0}
              onClick={onBookClick}
            >
              {spotsLeft === 0 ? "Registration Closed" : "Book Spot Now"}
            </Button>

            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                className="rounded-xl h-10 text-xs text-foreground border-border/60 hover:bg-muted/50 transition-colors shadow-sm"
                onClick={onWishlistToggle}
              >
                <Heart
                  className={`mr-1.5 h-4 w-4 ${
                    isWishlisted ? "fill-red-500 text-red-500" : ""
                  }`}
                />
                {isWishlisted ? "Wishlisted" : "Wishlist"}
              </Button>
              <Button
                variant="outline"
                className="rounded-xl h-10 text-xs text-foreground border-border/60 hover:bg-muted/50 transition-colors shadow-sm"
                onClick={onShareClick}
              >
                <Share2 className="mr-1.5 h-4 w-4" /> Share Event
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Trust badges */}
      <div className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground pt-2 text-center">
        <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
        <span>100% Secure Checkout & Refund Guarantee</span>
      </div>
    </div>
  );
}