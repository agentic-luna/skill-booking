"use client";

import React from "react";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { IndianRupee, Ticket } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProgramFormValues } from "./program-schema";

interface PricingSectionProps {
  register: UseFormRegister<ProgramFormValues>;
  errors: FieldErrors<ProgramFormValues>;
}

export default function PricingSection({ register, errors }: PricingSectionProps) {
  return (
    <Card className="rounded-[24px] border-none shadow-sm hover:shadow-md transition-all duration-300 bg-white overflow-hidden">
      <CardHeader className="bg-transparent border-b border-gray-100/50 pb-5 pt-6">
        <div className="flex items-center space-x-3.5">
          <div>
            <CardTitle className="text-[17px] font-extrabold text-gray-900">Pricing & Capacity</CardTitle>
            <CardDescription className="text-[13px] text-gray-500 font-medium">Set the enrollment fee and maximum participant slots.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-7">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Price */}
          <div className="space-y-2.5">
            <Label htmlFor="price" className="text-[13px] font-bold text-gray-700 flex items-center space-x-1.5">
              <IndianRupee className="h-4 w-4 text-gray-400" />
              <span>Fee (INR)</span>
            </Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[14px] text-gray-400 font-bold">₹</span>
              <Input
                id="price"
                type="number"
                className="h-11 text-[14px] pl-8 bg-emerald-50/30 border-emerald-100 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-600 hover:border-emerald-300 transition-all rounded-xl shadow-sm hover:shadow-md hover:shadow-emerald-900/5"
                {...register("price")}
              />
            </div>
            {errors.price && <p className="text-[12px] text-red-500 font-semibold">{errors.price.message}</p>}
          </div>

          {/* Max Spots */}
          <div className="space-y-2.5">
            <Label htmlFor="maxSpots" className="text-[13px] font-bold text-gray-700 flex items-center space-x-1.5">
              <Ticket className="h-4 w-4 text-gray-400" />
              <span>Max Enrollment Slots</span>
            </Label>
            <Input
              id="maxSpots"
              type="number"
              className="h-11 text-[14px] bg-emerald-50/30 border-emerald-100 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-600 hover:border-emerald-300 transition-all rounded-xl shadow-sm hover:shadow-md hover:shadow-emerald-900/5"
              {...register("maxSpots")}
            />
            {errors.maxSpots && <p className="text-[12px] text-red-500 font-semibold">{errors.maxSpots.message}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
