"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Calendar, Clock, MapPin, PlayCircle,
  FileText, Trash2, MessageSquare, Wifi, Timer, Ticket, HelpCircle, Star,
  ChevronDown, ChevronUp
} from "lucide-react";
import { useAlertStore } from "@/features/alerts/store/alertStore";
import type { ClientBooking } from "@/features/client/api/types";
import RefundStatusBadge from "@/features/payment/components/RefundStatusBadge";

interface BookingCardProps {
  booking: ClientBooking;
  onCancel: (booking: any) => void;
  onWriteReview: (booking: ClientBooking) => void;
}

// ─── Launch window helper ─────────────────────────────────────────────────────
// Returns how many seconds until launch opens (negative = already open)
function secondsUntilLaunch(startTime: Date): number {
  const launchOpensAt = new Date(startTime.getTime() - 5 * 60 * 1000); // T-5 min
  return Math.floor((launchOpensAt.getTime() - Date.now()) / 1000);
}

function formatCountdown(seconds: number): string {
  if (seconds <= 0) return "";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function BookingCard({ booking, onCancel, onWriteReview }: BookingCardProps) {
  const showAlert = useAlertStore((s) => s.showAlert);
  const [expanded, setExpanded] = useState(false);

  const event = booking.event;
  if (!event) return null;

  const startTime = new Date(event.startTime);
  const isOnline = event.mode === "ONLINE";

  const formattedDate = `${startTime.getDate().toString().padStart(2, '0')}-${startTime.toLocaleString('en-US', { month: 'short' })}-${startTime.getFullYear()}`;
  const formattedTime = startTime.toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase();
  const location = isOnline
    ? "Online Live Stream"
    : (event.venueDetails as any)?.address || "Physical Venue";
  const instructorName = event.host?.user
    ? `${event.host.user.firstName} ${event.host.user.lastName}`
    : "Platform Host";

  const bookedDateObj = new Date(booking.createdAt);
  const formattedBookedDate = `${bookedDateObj.getDate().toString().padStart(2, '0')}-${bookedDateObj.toLocaleString('en-US', { month: 'short' })}-${bookedDateObj.getFullYear()} ${bookedDateObj.toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase()}`;

  // ── Live countdown state (only for online confirmed bookings) ──
  const [secondsLeft, setSecondsLeft] = useState<number>(() =>
    isOnline && booking.status === "CONFIRMED" ? secondsUntilLaunch(startTime) : 1
  );

  useEffect(() => {
    if (!isOnline || booking.status !== "CONFIRMED") return;

    // Recalculate immediately
    setSecondsLeft(secondsUntilLaunch(startTime));

    const interval = setInterval(() => {
      const s = secondsUntilLaunch(startTime);
      setSecondsLeft(s);
      // Stop ticking once launch is open (no need to keep counting)
      if (s <= -3600) clearInterval(interval); // clear after 1h past start
    }, 1000);

    return () => clearInterval(interval);
  }, [isOnline, booking.status, startTime.toISOString()]);

  const launchEnabled = isOnline && secondsLeft <= 0;
  const countdown = secondsLeft > 0 ? formatCountdown(secondsLeft) : "";

  // ── Status badge colour ──
  const statusColor =
    booking.status === "CONFIRMED"
      ? "bg-primary/10 text-primary"
      : booking.status === "COMPLETED"
      ? "bg-emerald-500/10 text-emerald-600"
      : booking.status === "PENDING"
      ? "bg-amber-500/10 text-amber-500"
      : "bg-destructive/10 text-destructive";

  return (
    <Card className="overflow-hidden border-border/40 rounded-xl bg-card hover:border-primary/20 transition-all duration-300 shadow-2xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between p-4 gap-4">
        
        {/* Left: Thumbnail & Details */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden shrink-0 relative bg-muted border border-border/10">
            <img
              src={event.posterUrl || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=300"}
              alt={event.title}
              className="object-cover w-full h-full"
            />
            <span className={`absolute bottom-1 left-1 text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide bg-background/90 text-foreground border border-border/10`}>
              {isOnline ? "Online" : "Venue"}
            </span>
          </div>

          <div className="space-y-1.5 min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-bold text-sm sm:text-base text-foreground leading-snug truncate">
                {event.title}
              </h3>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md uppercase ${statusColor}`}>
                  {booking.status}
                </span>
                {(booking.status === "CANCELED" || booking.status === "CANCELLED" || booking.status === "REFUNDED" || event.status === "CANCELED" || event.status === "CANCELLED") && (
                  <RefundStatusBadge bookingId={booking.id} variant="badge" />
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span className="flex items-center"><Calendar className="h-3.5 w-3.5 mr-1" />{formattedDate}</span>
              <span className="flex items-center"><Clock className="h-3.5 w-3.5 mr-1" />{formattedTime}</span>
              <span className="flex items-center max-w-[200px] sm:max-w-xs truncate">
                {isOnline ? <Wifi className="h-3.5 w-3.5 mr-1 text-primary shrink-0" /> : <MapPin className="h-3.5 w-3.5 mr-1 shrink-0" />}
                {location}
              </span>
            </div>

            <div className="text-[11px] text-muted-foreground">
              <div className="mb-1">
                Host: <span className="font-medium text-foreground">{instructorName}</span>
                <span className="mx-1.5">•</span>
                Seats: <span className="font-bold text-foreground">{booking.seatCount}</span>
                <span className="mx-1.5">•</span>
                Paid: <span className="font-bold text-foreground font-mono">₹{booking.totalAmount ?? (booking as any).amountPaid}</span>
              </div>
              <div>
                Booked On: <span className="font-medium text-foreground">{formattedBookedDate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Actions Container */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap md:flex-nowrap items-center gap-2.5 sm:gap-2 justify-end shrink-0 pt-3 md:pt-0 mt-3 md:mt-0 border-t md:border-t-0 border-border/10 w-full md:w-auto">
          {/* Details & Help Link */}
          <Link href={`/dashboard/tickets/${booking.id}`} className="w-full sm:w-auto">
            <Button
              size="sm"
              className="w-full h-8 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs border-0"
            >
              <HelpCircle className="h-3.5 w-3.5 mr-1 shrink-0" /> View Details
            </Button>
          </Link>

          <Button
            size="sm"
            className="w-full sm:w-auto h-8 text-xs font-semibold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <>
                <ChevronUp className="h-3.5 w-3.5 mr-1 shrink-0" /> Hide Info
              </>
            ) : (
              <>
                <ChevronDown className="h-3.5 w-3.5 mr-1 shrink-0" /> Show Info
              </>
            )}
          </Button>

          {/* Invoice */}
          <Button
            size="sm"
            className="w-full sm:w-auto h-8 text-xs font-semibold rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700"
            onClick={async () => {
              try {
                const token = localStorage.getItem("bms_access_token");
                const { getInvoiceUrl } = await import("@/features/client/api/client.api");
                const invoiceUrl = getInvoiceUrl(booking.id);
                const res = await fetch(invoiceUrl, {
                  headers: token ? { Authorization: `Bearer ${token}` } : {},
                });
                if (!res.ok) throw new Error("Failed to generate and download invoice");
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.style.display = "none";
                a.href = url;
                a.download = `invoice_${booking.id.slice(0, 8).toUpperCase()}.pdf`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
                showAlert("Receipt Downloaded", "Your PDF invoice has been generated and downloaded.", "success");
              } catch (err: any) {
                showAlert("Download Failed", err.message || "Failed to download receipt.", "destructive");
              }
            }}
          >
            <FileText className="h-3.5 w-3.5 mr-1 shrink-0" /> Invoice
          </Button>

          {/* Ticket PDF */}
          {(booking.status === "CONFIRMED" || booking.status === "COMPLETED") && (
            <Button
              size="sm"
              className="w-full sm:w-auto h-8 text-xs font-semibold rounded-lg border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800"
              onClick={async () => {
                try {
                  const token = localStorage.getItem("bms_access_token");
                  const { getTicketUrl } = await import("@/features/client/api/client.api");
                  const ticketUrl = `${getTicketUrl(booking.id)}?format=pdf`;
                  const res = await fetch(ticketUrl, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                  });
                  if (!res.ok) throw new Error("Failed to generate and download PDF ticket");
                  const blob = await res.blob();
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.style.display = "none";
                  a.href = url;
                  a.download = `ticket_${booking.id.slice(0, 8).toUpperCase()}.pdf`;
                  document.body.appendChild(a);
                  a.click();
                  a.remove();
                  window.URL.revokeObjectURL(url);
                  showAlert("PDF Ticket Downloaded", "Your admission ticket PDF has been downloaded.", "success");
                } catch (err: any) {
                  showAlert("Download Failed", err.message || "Failed to download PDF ticket.", "destructive");
                }
              }}
            >
              <FileText className="h-3.5 w-3.5 mr-1 shrink-0" /> Pass (PDF)
            </Button>
          )}

          {/* Leave Review – completed or confirmed past events */}
          {(booking.status === "COMPLETED" || (booking.status === "CONFIRMED" && new Date(event.startTime).getTime() + (event.durationHours || 2) * 60 * 60 * 1000 < Date.now())) && (
            <Button
              size="sm"
              className="w-full sm:w-auto h-8 text-xs font-semibold rounded-lg border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:text-amber-800"
              onClick={() => onWriteReview(booking)}
            >
              <Star className="h-3.5 w-3.5 mr-1 text-amber-500 fill-amber-500 shrink-0" /> Rate
            </Button>
          )}

          {/* Confirmed-only actions */}
          {booking.status === "CONFIRMED" && (
            <Button
              size="sm"
              className="w-full sm:w-auto h-8 text-xs font-semibold rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
              onClick={() => onCancel(booking)}
            >
              <Trash2 className="h-3.5 w-3.5 mr-1 shrink-0" /> Cancel
            </Button>
          )}

          {/* Launch Class */}
          {booking.status === "CONFIRMED" && isOnline && (
            <div className="relative group w-full sm:w-auto col-span-2 sm:col-span-1 mt-4 sm:mt-0">
              <Button
                size="sm"
                disabled={!launchEnabled}
                className={`w-full h-8 text-xs font-semibold rounded-lg transition-all border-0 ${
                  launchEnabled
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/30"
                    : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                }`}
                onClick={() => {
                  const meetingLink = event.venueDetails?.meetingLink || (event as any)?.venue?.meetingLink;
                  if (meetingLink) {
                    window.open(meetingLink, "_blank");
                  } else {
                    showAlert("Launch Class", "Live session link is not set yet. Please check back closer to the event start time.", "warning");
                  }
                }}
              >
                <PlayCircle className="h-3.5 w-3.5 mr-1 shrink-0" />
                Launch
              </Button>

              {/* Countdown locked badge */}
              {!launchEnabled && countdown && (
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-popover border border-border/40 text-foreground text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow pointer-events-none flex items-center gap-1 z-10">
                  <Timer className="h-3 w-3 text-amber-500" />
                  Locked
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-border/10 bg-muted/10 p-4 space-y-3 text-xs animate-in fade-in slide-in-from-top-1 duration-200">
          <div>
            <span className="font-bold text-foreground block mb-1">About the Event</span>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line text-[11px]">{event.description || "No description available."}</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-border/10">
            <div>
              <span className="text-muted-foreground text-[10px] block font-medium">Category</span>
              <span className="font-bold text-foreground text-[11px] capitalize">{event.category?.replace(/-/g, ' ') || "General"}</span>
            </div>
            <div>
              <span className="text-muted-foreground text-[10px] block font-medium">Duration</span>
              <span className="font-bold text-foreground text-[11px]">{event.duration || `${event.durationHours || 2} Hours`}</span>
            </div>
            <div>
              <span className="text-muted-foreground text-[10px] block font-medium">Trainer/Instructor</span>
              <span className="font-bold text-foreground text-[11px]">{event.venueDetails?.instructorName || instructorName}</span>
            </div>
            <div>
              <span className="text-muted-foreground text-[10px] block font-medium">Venue Mode</span>
              <span className="font-bold text-foreground text-[11px]">{isOnline ? "Online Live Stream" : "In-Person Venue"}</span>
            </div>
          </div>
          <div className="pt-2 border-t border-border/10">
            <span className="text-muted-foreground text-[10px] block font-medium">
              {isOnline ? "Meeting Link" : "Venue Address"}
            </span>
            <span className="font-bold text-foreground text-[11px] block mt-0.5">
              {isOnline 
                ? (event.venueDetails?.meetingLink || (event as any)?.venue?.meetingLink || "Streaming link will be available closer to the event start time.")
                : (event.venueDetails?.address || (event as any)?.venue?.address || "Venue Address Not Specified")
              }
            </span>
          </div>
        </div>
      )}
    </Card>
  );
}
