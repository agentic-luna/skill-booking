"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Calendar, Clock, MapPin, PlayCircle,
  FileText, Trash2, MessageSquare, Wifi, Timer
} from "lucide-react";
import { useAlertStore } from "@/features/alerts/store/alertStore";
import type { ClientBooking } from "@/features/client/api/types";

interface BookingCardProps {
  booking: ClientBooking;
  onCancel: (id: string) => void;
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

  const event = booking.event;
  if (!event) return null;

  const startTime = new Date(event.startTime);
  const isOnline = event.mode === "ONLINE";

  const formattedDate = startTime.toLocaleDateString();
  const formattedTime = startTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const location = isOnline
    ? "Online Live Stream"
    : (event.venueDetails as any)?.address || "Physical Venue";
  const instructorName = event.host?.user
    ? `${event.host.user.firstName} ${event.host.user.lastName}`
    : "Platform Host";

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
    <Card className="overflow-hidden border-border/40 rounded-2xl shadow-xs bg-card">
      <div className="flex flex-col sm:flex-row">

        {/* Thumbnail */}
        <div className="sm:w-48 aspect-video sm:aspect-auto bg-muted relative">
          <img
            src={event.posterUrl || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=300"}
            alt={event.title}
            className="object-cover w-full h-full"
          />
          {/* Mode badge over thumbnail */}
          <span className={`absolute top-2 left-2 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${
            isOnline
              ? "bg-primary/90 text-primary-foreground"
              : "bg-foreground/80 text-background"
          }`}>
            {isOnline ? "Online" : "In-Person"}
          </span>
        </div>

        <div className="flex-1 p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex justify-between items-start gap-2">
              <h3 className="font-bold text-base text-foreground leading-tight">
                {event.title}
              </h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase shrink-0 ${statusColor}`}>
                {booking.status}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground pt-1">
              <span className="flex items-center"><Calendar className="h-3.5 w-3.5 mr-1.5" />{formattedDate}</span>
              <span className="flex items-center"><Clock className="h-3.5 w-3.5 mr-1.5" />{formattedTime}</span>
              <span className="flex items-center sm:col-span-2">
                {isOnline
                  ? <Wifi className="h-3.5 w-3.5 mr-1.5 text-primary" />
                  : <MapPin className="h-3.5 w-3.5 mr-1.5" />
                }
                {location}
              </span>
            </div>
          </div>

          {/* Footer row */}
          <div className="flex flex-wrap items-center justify-between border-t border-border/40 pt-4 gap-3">
            <div className="text-xs text-muted-foreground">
              Host: <span className="font-medium text-foreground">{instructorName}</span>
              <span className="mx-2">•</span>
              Seats: <span className="font-bold text-foreground">{booking.seatCount}</span>
              <span className="mx-2">•</span>
              Paid: <span className="font-bold text-foreground">₹{booking.totalAmount ?? booking.amountPaid}</span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">

              {/* Invoice */}
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs rounded-lg"
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
                <FileText className="h-3.5 w-3.5 mr-1" /> Invoice
              </Button>

              {/* Leave Review – completed only */}
              {booking.status === "COMPLETED" && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs rounded-lg border-primary/20 text-primary hover:bg-primary/5"
                  onClick={() => onWriteReview(booking)}
                >
                  <MessageSquare className="h-3.5 w-3.5 mr-1" /> Leave Review
                </Button>
              )}

              {/* Confirmed-only actions */}
              {booking.status === "CONFIRMED" && (
                <>
                  {/* Cancel */}
                  <Button
                    variant="destructive"
                    size="sm"
                    className="h-8 text-xs rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 hover:text-destructive border-transparent"
                    onClick={() => onCancel(booking.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" /> Cancel
                  </Button>

                  {/*
                   * Launch Class:
                   *  - OFFLINE → hidden entirely
                   *  - ONLINE  → visible, disabled until T-5 min, countdown badge shown
                   */}
                  {isOnline && (
                    <div className="relative group">
                      <Button
                        size="sm"
                        disabled={!launchEnabled}
                        className={`h-8 text-xs rounded-lg transition-all ${
                          launchEnabled
                            ? "bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-600/30"
                            : "opacity-60 cursor-not-allowed"
                        }`}
                        onClick={() =>
                          showAlert(
                            "Room Launching",
                            "Launching your live workshop room. Please allow popup access in your browser.",
                            "info"
                          )
                        }
                      >
                        <PlayCircle className="h-3.5 w-3.5 mr-1" />
                        Launch Class
                      </Button>

                      {/* Countdown tooltip / pill shown when still locked */}
                      {!launchEnabled && countdown && (
                        <span className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-popover border border-border/40 text-foreground text-[9px] font-bold px-2 py-0.5 rounded-full shadow pointer-events-none flex items-center gap-1">
                          <Timer className="h-2.5 w-2.5 text-amber-500" />
                          Opens in {countdown}
                        </span>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
