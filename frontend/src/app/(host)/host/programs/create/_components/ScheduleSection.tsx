"use client";

import React from "react";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { Calendar, Clock, MapPin } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProgramFormValues } from "./program-schema";

interface ScheduleSectionProps {
  register: UseFormRegister<ProgramFormValues>;
  errors: FieldErrors<ProgramFormValues>;
}

export default function ScheduleSection({ register, errors }: ScheduleSectionProps) {
  return (
    <Card className="rounded-2xl border-border/40 bg-card overflow-hidden">
      <CardHeader className="bg-muted/30 border-b border-border/30">
        <div className="flex items-center space-x-2.5">
          <div className="bg-blue-500/10 text-blue-500 p-2 rounded-lg">
            <Calendar className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-sm font-bold">Schedule & Logistics</CardTitle>
            <CardDescription className="text-xs">Date, time, duration, and venue details.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
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
              <span>Schedule Times</span>
            </Label>
            <Input
              id="time"
              placeholder="e.g. 10:00 AM - 1:00 PM EST"
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
              placeholder="e.g. 6 hours (2 days)"
              className="h-10 text-sm"
              {...register("duration")}
            />
            {errors.duration && <p className="text-[11px] text-destructive font-medium">{errors.duration.message}</p>}
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location" className="text-xs font-semibold flex items-center space-x-1.5">
              <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Venue / Webinar Link</span>
            </Label>
            <Input
              id="location"
              placeholder="Online Zoom link or studio address"
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
