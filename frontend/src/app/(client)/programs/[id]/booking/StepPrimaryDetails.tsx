"use client";

import React from "react";
import { User, Mail, Phone, Calendar, MapPin, Globe } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { PrimaryParticipant, ParticipantDetail } from "./types";

interface StepPrimaryDetailsProps {
  primary: PrimaryParticipant;
  primaryErrors: Partial<Record<keyof PrimaryParticipant, string>>;
  onPrimaryChange: (field: keyof PrimaryParticipant, value: string) => void;
  qty: number;
  additionals: ParticipantDetail[];
  onAdditionalChange: (idx: number, field: keyof ParticipantDetail, value: string) => void;
}

const GENDER_OPTIONS = [
  { value: "", label: "Select Gender" },
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "non-binary", label: "Non-binary" },
  { value: "prefer-not-to-say", label: "Prefer not to say" },
];

export default function StepPrimaryDetails({
  primary,
  primaryErrors,
  onPrimaryChange,
  qty,
  additionals,
  onAdditionalChange,
}: StepPrimaryDetailsProps) {
  return (
    <div className="space-y-5">
      {/* ── Primary Participant ── */}
      <div>
        <h3 className="font-bold text-sm text-foreground mb-1">Primary Participant Details</h3>
        <p className="text-[11px] text-muted-foreground">These details are for the main booking contact.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Full Name */}
        <div className="space-y-1">
          <Label className="text-xs font-semibold flex items-center gap-1.5">
            <User className="h-3 w-3 text-muted-foreground" /> Full Name *
          </Label>
          <Input
            placeholder="e.g. Rohan Mehta"
            className="h-9 text-xs"
            value={primary.fullName}
            onChange={e => onPrimaryChange("fullName", e.target.value)}
          />
          {primaryErrors.fullName && <p className="text-[10px] text-destructive">{primaryErrors.fullName}</p>}
        </div>

        {/* Email */}
        <div className="space-y-1">
          <Label className="text-xs font-semibold flex items-center gap-1.5">
            <Mail className="h-3 w-3 text-muted-foreground" /> Email Address *
          </Label>
          <Input
            type="email"
            placeholder="e.g. rohan@example.com"
            className="h-9 text-xs"
            value={primary.email}
            onChange={e => onPrimaryChange("email", e.target.value)}
          />
          {primaryErrors.email && <p className="text-[10px] text-destructive">{primaryErrors.email}</p>}
        </div>

        {/* Mobile */}
        <div className="space-y-1">
          <Label className="text-xs font-semibold flex items-center gap-1.5">
            <Phone className="h-3 w-3 text-muted-foreground" /> Mobile Number *
          </Label>
          <Input
            type="tel"
            placeholder="e.g. +91 9876543210"
            className="h-9 text-xs"
            value={primary.mobile}
            onChange={e => onPrimaryChange("mobile", e.target.value)}
          />
          {primaryErrors.mobile && <p className="text-[10px] text-destructive">{primaryErrors.mobile}</p>}
        </div>

        {/* DOB */}
        <div className="space-y-1">
          <Label className="text-xs font-semibold flex items-center gap-1.5">
            <Calendar className="h-3 w-3 text-muted-foreground" /> Date of Birth *
          </Label>
          <Input
            type="date"
            className="h-9 text-xs"
            value={primary.dob}
            onChange={e => onPrimaryChange("dob", e.target.value)}
          />
          {primaryErrors.dob && <p className="text-[10px] text-destructive">{primaryErrors.dob}</p>}
        </div>

        {/* Gender */}
        <div className="space-y-1">
          <Label className="text-xs font-semibold">Gender *</Label>
          <select
            className="h-9 text-xs w-full border border-input rounded-md bg-background px-3 focus:outline-none focus:ring-2 focus:ring-ring"
            value={primary.gender}
            onChange={e => onPrimaryChange("gender", e.target.value)}
          >
            {GENDER_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          {primaryErrors.gender && <p className="text-[10px] text-destructive">{primaryErrors.gender}</p>}
        </div>

        {/* City */}
        <div className="space-y-1">
          <Label className="text-xs font-semibold flex items-center gap-1.5">
            <MapPin className="h-3 w-3 text-muted-foreground" /> City *
          </Label>
          <Input
            placeholder="e.g. Mumbai"
            className="h-9 text-xs"
            value={primary.city}
            onChange={e => onPrimaryChange("city", e.target.value)}
          />
          {primaryErrors.city && <p className="text-[10px] text-destructive">{primaryErrors.city}</p>}
        </div>

        {/* State */}
        <div className="space-y-1">
          <Label className="text-xs font-semibold">State</Label>
          <Input
            placeholder="e.g. Maharashtra"
            className="h-9 text-xs"
            value={primary.state}
            onChange={e => onPrimaryChange("state", e.target.value)}
          />
        </div>

        {/* Country */}
        <div className="space-y-1">
          <Label className="text-xs font-semibold flex items-center gap-1.5">
            <Globe className="h-3 w-3 text-muted-foreground" /> Country
          </Label>
          <Input
            placeholder="e.g. India"
            className="h-9 text-xs"
            value={primary.country}
            onChange={e => onPrimaryChange("country", e.target.value)}
          />
        </div>
      </div>

      {/* ── Additional Participants ── */}
      {qty > 1 && (
        <div className="space-y-4 pt-2">
          <Separator />
          <h3 className="font-bold text-sm text-foreground">Additional Participant Details</h3>
          {additionals.map((p, i) => (
            <div key={i} className="border border-border/40 rounded-xl p-4 space-y-3 bg-muted/10">
              <div className="text-xs font-bold text-foreground flex items-center gap-2">
                <div className="h-5 w-5 bg-primary/10 text-primary rounded-full flex items-center justify-center text-[10px] font-extrabold">
                  {i + 2}
                </div>
                Participant {i + 2}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Full Name</Label>
                  <Input placeholder="Full Name" className="h-8 text-xs" value={p.fullName}
                    onChange={e => onAdditionalChange(i, "fullName", e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Email Address</Label>
                  <Input type="email" placeholder="Email" className="h-8 text-xs" value={p.email}
                    onChange={e => onAdditionalChange(i, "email", e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Mobile Number</Label>
                  <Input type="tel" placeholder="+91 9876543210" className="h-8 text-xs" value={p.mobile}
                    onChange={e => onAdditionalChange(i, "mobile", e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Age</Label>
                  <Input type="number" placeholder="Age" min="1" max="120" className="h-8 text-xs" value={p.age}
                    onChange={e => onAdditionalChange(i, "age", e.target.value)} />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <Label className="text-xs">Gender</Label>
                  <select className="h-8 text-xs w-full border border-input rounded-md bg-background px-3 focus:outline-none"
                    value={p.gender} onChange={e => onAdditionalChange(i, "gender", e.target.value)}>
                    {GENDER_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
