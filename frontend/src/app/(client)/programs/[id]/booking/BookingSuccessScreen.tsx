"use client";

import React from "react";
import { CheckCircle2, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { BookingSummary } from "./types";

interface BookingSuccessScreenProps {
  programTitle: string;
  qty: number;
  summary: BookingSummary;
  onClose: () => void;
  onGoToBookings: () => void;
}

export default function BookingSuccessScreen({
  programTitle,
  qty,
  summary,
  onClose,
  onGoToBookings,
}: BookingSuccessScreenProps) {
  // Generate a stable-looking booking ID (client-side, demo only)
  const bookingId = React.useMemo(
    () => "BK-" + Date.now().toString(36).toUpperCase(),
    []
  );

  const notifications = [
    { icon: CheckCircle2, text: "Confirmation Email Sent" },
    { icon: CheckCircle2, text: "SMS Notification Dispatched" },
    { icon: CheckCircle2, text: "WhatsApp Confirmation Sent" },
    { icon: Receipt, text: "Invoice/Receipt Generated" },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-10 px-6 text-center space-y-5">
      {/* Hero icon */}
      <div className="h-16 w-16 bg-emerald-500/10 rounded-full flex items-center justify-center">
        <CheckCircle2 className="h-9 w-9 text-emerald-500" />
      </div>

      <div className="space-y-1.5">
        <h3 className="text-xl font-extrabold text-foreground">Booking Confirmed! 🎉</h3>
        <p className="text-xs text-muted-foreground max-w-xs">
          Your spot has been reserved. A confirmation email, SMS, and invoice have been dispatched.
        </p>
      </div>

      {/* Booking receipt */}
      <div className="bg-muted/40 rounded-xl border p-4 text-left space-y-2.5 w-full max-w-sm">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Booking ID</span>
          <span className="font-bold text-foreground font-mono">{bookingId}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Program</span>
          <span className="font-semibold text-foreground max-w-[180px] truncate">{programTitle}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Participants</span>
          <span className="font-semibold text-foreground">{qty}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Amount Paid</span>
          <span className="font-extrabold text-foreground">₹{summary.total.toFixed(2)}</span>
        </div>
        <Separator />
        <div className="text-[10px] text-muted-foreground text-center">
          Status: <span className="text-emerald-500 font-bold">Booking Confirmed ✓</span>
        </div>
      </div>

      {/* Notification confirmations */}
      <div className="space-y-1.5 text-[10px] text-muted-foreground">
        {notifications.map(({ icon: Icon, text }) => (
          <div key={text} className="flex items-center gap-1.5 justify-center">
            <Icon className="h-3 w-3 text-emerald-500" />
            {text}
          </div>
        ))}
      </div>

      {/* CTA buttons */}
      <div className="flex gap-2 w-full max-w-sm pt-2">
        <Button variant="outline" className="flex-1 text-xs rounded-xl h-10" onClick={onClose}>
          Close
        </Button>
        <Button className="flex-1 text-xs rounded-xl h-10" onClick={onGoToBookings}>
          My Bookings
        </Button>
      </div>
    </div>
  );
}
