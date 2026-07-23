"use client";

import React from "react";
import { UseFormRegister, FieldErrors, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { Calendar, Clock, MapPin, Video, MapPinned, Users } from "lucide-react";

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
    <Card className="rounded-[24px] border-none shadow-sm hover:shadow-md transition-all duration-300 bg-white overflow-hidden">
      <CardHeader className="bg-transparent border-b border-gray-100/50 pb-5 pt-6">
        <div className="flex items-center space-x-3.5">
          <div className="bg-purple-50 text-purple-600 p-2.5 rounded-xl shadow-sm">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-[17px] font-extrabold text-gray-900">Schedule & Logistics</CardTitle>
            <CardDescription className="text-[13px] text-gray-500 font-medium">Mode, date, time, duration, and venue details.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-7 space-y-7">

        {/* ── Delivery Mode & Location Address ───────────────────────── */}
        <div className="space-y-5 bg-gray-50/50 p-6 rounded-[20px] border border-gray-200/50">
          <div className="space-y-2.5">
            <Label className="text-[13px] font-bold text-gray-700 flex items-center space-x-1.5">
              <Video className="h-4 w-4 text-gray-400" />
              <span>Delivery Mode</span>
            </Label>
            <div className="flex gap-3">
              {(["OFFLINE", "ONLINE"] as const).map((m) => {
                const active = selectedMode === m;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setValue("mode", m, { shouldValidate: true })}
                    className={`
                      flex items-center gap-2 flex-1 py-3 px-5 rounded-xl border text-[13px] font-bold
                      transition-all duration-300 select-none
                      ${active
                        ? "bg-emerald-50/50 border-emerald-300 text-emerald-700 shadow-sm ring-1 ring-emerald-500/20"
                        : "bg-transparent border-gray-200 text-gray-500 hover:bg-white hover:border-gray-300"
                      }
                    `}
                  >
                    <div className={`p-1.5 rounded-lg transition-colors ${
                      active 
                        ? "bg-emerald-100 text-emerald-700" 
                        : "bg-gray-100 text-gray-400 group-hover:text-gray-600"
                    }`}>
                      {m === "ONLINE" ? <Video className="h-4 w-4" /> : <Users className="h-4 w-4" />}
                    </div>
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

          <div className="space-y-2.5">
            <Label htmlFor="location" className="text-[13px] font-bold text-gray-700 flex items-center space-x-1.5">
              <MapPin className="h-4 w-4 text-gray-400" />
              <span>{selectedMode === "ONLINE" ? "Webinar / Stream Link" : "Venue Address / Map Location"}</span>
            </Label>
            <Input
              id="location"
              placeholder={selectedMode === "ONLINE" ? "https://zoom.us/j/..." : "123 Workshop St, City or Google Maps link"}
              className="h-11 text-[14px] bg-emerald-50/30 border-emerald-100 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-600 hover:border-emerald-300 transition-all rounded-xl shadow-sm hover:shadow-md hover:shadow-emerald-900/5"
              {...register("location")}
            />
            {errors.location && <p className="text-[12px] text-red-500 font-semibold">{errors.location.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Date */}
          <div className="space-y-2.5">
            <Label htmlFor="date" className="text-[13px] font-bold text-gray-700 flex items-center space-x-1.5">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span>Event Date</span>
            </Label>
            <Input
              id="date"
              type="date"
              className="h-11 text-[14px] bg-emerald-50/30 border-emerald-100 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-600 hover:border-emerald-300 transition-all rounded-xl shadow-sm hover:shadow-md hover:shadow-emerald-900/5"
              {...register("date")}
            />
            {errors.date && <p className="text-[12px] text-red-500 font-semibold">{errors.date.message}</p>}
          </div>

          {/* Time */}
          <div className="space-y-2.5">
            <Label htmlFor="time" className="text-[13px] font-bold text-gray-700 flex items-center space-x-1.5">
              <Clock className="h-4 w-4 text-gray-400" />
              <span>Start Time</span>
            </Label>
            <Input
              id="time"
              type="time"
              className="h-11 text-[14px] bg-emerald-50/30 border-emerald-100 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-600 hover:border-emerald-300 transition-all rounded-xl shadow-sm hover:shadow-md hover:shadow-emerald-900/5"
              {...register("time")}
            />
            {errors.time && <p className="text-[12px] text-red-500 font-semibold">{errors.time.message}</p>}
          </div>

          {/* Duration */}
          <div className="space-y-2.5">
            <Label htmlFor="duration" className="text-[13px] font-bold text-gray-700 flex items-center space-x-1.5">
              <Clock className="h-4 w-4 text-gray-400" />
              <span>Duration</span>
            </Label>
            <Input
              id="duration"
              placeholder="e.g. 3 hours or 2 days"
              className="h-11 text-[14px] bg-emerald-50/30 border-emerald-100 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-600 hover:border-emerald-300 transition-all rounded-xl shadow-sm hover:shadow-md hover:shadow-emerald-900/5"
              {...register("duration")}
            />
            {errors.duration && <p className="text-[12px] text-red-500 font-semibold">{errors.duration.message}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
