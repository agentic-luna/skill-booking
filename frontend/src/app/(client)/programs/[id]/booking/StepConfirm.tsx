"use client";

import React from "react";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, Timer, MapPin } from "lucide-react";
import { SummaryRow } from "./BookingAtoms";
import { PrimaryParticipant, BookingSummary } from "./types";
import { Program } from "@/constants/mockData";

interface StepConfirmProps {
  program: Program;
  primary: PrimaryParticipant;
  qty: number;
  summary: BookingSummary;
}

export default function StepConfirm({ program, primary, qty, summary }: StepConfirmProps) {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-bold text-sm text-foreground mb-1">Booking Confirmation</h3>
        <p className="text-[11px] text-muted-foreground">Review your details before submitting.</p>
      </div>

      {/* Workshop details */}
      <div className="bg-muted/20 rounded-xl border p-4 space-y-2.5">
        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Workshop</div>
        <div className="font-bold text-sm text-foreground">{program.title}</div>
        <div className="grid grid-cols-2 gap-1.5 text-[11px] text-muted-foreground mt-2">
          <span className="flex items-center"><Calendar className="inline h-3 w-3 mr-1.5" /> {program.date}</span>
          <span className="flex items-center"><Clock className="inline h-3 w-3 mr-1.5" /> {program.time}</span>
          <span className="flex items-center"><Timer className="inline h-3 w-3 mr-1.5" /> {program.duration}</span>
          <span className="flex items-center truncate"><MapPin className="inline h-3 w-3 mr-1.5 shrink-0" /> {program.location.split(",")[0]}</span>
        </div>
      </div>

      {/* Primary Participant */}
      <div className="bg-muted/20 rounded-xl border p-4 space-y-2">
        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Primary Participant</div>
        <div className="grid grid-cols-2 gap-1 text-[11px]">
          <span className="text-muted-foreground">Name</span>
          <span className="font-semibold text-foreground">{primary.fullName || "—"}</span>
          <span className="text-muted-foreground">Email</span>
          <span className="font-semibold text-foreground truncate">{primary.email || "—"}</span>
          <span className="text-muted-foreground">Mobile</span>
          <span className="font-semibold text-foreground">{primary.mobile || "—"}</span>
          <span className="text-muted-foreground">City</span>
          <span className="font-semibold text-foreground">{primary.city || "—"}, {primary.country}</span>
        </div>
      </div>

      {/* Payment Summary */}
      <div className="bg-muted/20 rounded-xl border p-4 space-y-2.5">
        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Payment</div>
        <SummaryRow
          label={`${qty} Seat${qty > 1 ? "s" : ""} × ₹${program.price}`}
          value={`₹${summary.programFee.toFixed(2)}`}
        />
        <SummaryRow
          label="Platform Fee"
          value={`₹${summary.platformFee.toFixed(2)}`}
        />
        <Separator />
        <SummaryRow label="Total" value={`₹${summary.total.toFixed(2)}`} bold accent />
        <div className="text-[10px] text-muted-foreground pt-1">
          via <span className="font-semibold text-foreground">Razorpay</span>
        </div>
      </div>

      {/* Status Flow */}
      <div className="text-[10px] text-muted-foreground bg-muted/20 border rounded-xl p-3 leading-relaxed">
        <span className="font-bold text-foreground">Booking Status Flow: </span>
        Pending Payment → Payment Successful →{" "}
        <span className="text-emerald-500 font-bold">Booking Confirmed</span>
        {" "}→ Program Started → Program Completed
      </div>
    </div>
  );
}
