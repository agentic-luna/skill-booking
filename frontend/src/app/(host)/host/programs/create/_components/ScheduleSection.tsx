"use client";

import React from "react";
import { UseFormRegister, FieldErrors, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { Calendar, Clock, MapPin, Video, MapPinned } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProgramFormValues } from "./program-schema";

interface ScheduleSectionProps {
  register: UseFormRegister<ProgramFormValues>;
  errors: FieldErrors<ProgramFormValues>;
  setValue: UseFormSetValue<ProgramFormValues>;
  watch: UseFormWatch<ProgramFormValues>;
}

export default function ScheduleSection({ register, errors, setValue, watch }: ScheduleSectionProps) {
  const selectedMode = watch("mode");

  return (
    <Card className="rounded-2xl border-border/40 bg-card overflow-hidden">
      <CardHeader className="bg-muted/30 border-b border-border/30">
        <div className="flex items-center space-x-2.5">
          <div className="bg-blue-500/10 text-blue-500 p-2 rounded-lg">
            <Calendar className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-sm font-bold">Schedule & Logistics</CardTitle>
            <CardDescription className="text-xs">Mode, date, time, duration, and venue details.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-5">

        {/* ── Delivery Mode ─────────────────────────────────────────── */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold flex items-center space-x-1.5">
            <Video className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Delivery Mode</span>
          </Label>
          <div className="flex gap-3">
            {(["ONLINE", "OFFLINE"] as const).map((m) => {
              const active = selectedMode === m;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => setValue("mode", m, { shouldValidate: true })}
                  className={`
                    flex items-center gap-2 flex-1 py-2.5 px-4 rounded-xl border text-xs font-bold
                    transition-all duration-200 select-none
                    ${active
                      ? m === "ONLINE"
                        ? "bg-blue-500/10 border-blue-500/40 text-blue-600 dark:text-blue-400 shadow-sm"
                        : "bg-emerald-500/10 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 shadow-sm"
                      : "bg-muted/40 border-border/40 text-muted-foreground hover:bg-muted/70 hover:border-border/70"
                    }
                  `}
                >
                  {m === "ONLINE"
                    ? <Video className="h-3.5 w-3.5 shrink-0" />
                    : <MapPinned className="h-3.5 w-3.5 shrink-0" />
                  }
                  <span>{m === "ONLINE" ? "Online / Virtual" : "In-Person / Offline"}</span>
                  {active && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-current" />
                  )}
                </button>
              );
            })}
          </div>
          {/* Hidden input to integrate with react-hook-form */}
          <input type="hidden" {...register("mode")} />
          {errors.mode && <p className="text-[11px] text-destructive font-medium">{errors.mode.message}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date" className="text-xs font-semibold flex items-center space-x-1.5">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Event Date</span>
            </Label>
            <Input
              id="date"
              type="date"
              className="h-10 text-sm"
              {...register("date")}
            />
            {errors.date && <p className="text-[11px] text-destructive font-medium">{errors.date.message}</p>}
          </div>

          {/* Time */}
          <div className="space-y-2">
            <Label htmlFor="time" className="text-xs font-semibold flex items-center space-x-1.5">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Start Time</span>
            </Label>
            <Input
              id="time"
              type="time"
              className="h-10 text-sm"
              {...register("time")}
            />
            {errors.time && <p className="text-[11px] text-destructive font-medium">{errors.time.message}</p>}
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label htmlFor="duration" className="text-xs font-semibold flex items-center space-x-1.5">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Duration</span>
            </Label>
            <Input
              id="duration"
              placeholder="e.g. 3 hours or 2 days"
              className="h-10 text-sm"
              {...register("duration")}
            />
            {errors.duration && <p className="text-[11px] text-destructive font-medium">{errors.duration.message}</p>}
          </div>

          {/* Location / Venue */}
          <div className="space-y-2">
            <Label htmlFor="location" className="text-xs font-semibold flex items-center space-x-1.5">
              <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
              <span>{selectedMode === "ONLINE" ? "Webinar / Stream Link" : "Venue Address"}</span>
            </Label>
            <Input
              id="location"
              placeholder={selectedMode === "ONLINE" ? "https://zoom.us/j/..." : "123 Workshop St, City"}
              className="h-10 text-sm"
              {...register("location")}
            />
            {errors.location && <p className="text-[11px] text-destructive font-medium">{errors.location.message}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
