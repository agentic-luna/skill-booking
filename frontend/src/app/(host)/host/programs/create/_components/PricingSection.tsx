"use client";

import React from "react";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { DollarSign, Ticket } from "lucide-react";

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
    <Card className="rounded-2xl border-border/40 bg-card overflow-hidden">
      <CardHeader className="bg-muted/30 border-b border-border/30">
        <div className="flex items-center space-x-2.5">
          <div className="bg-emerald-500/10 text-emerald-500 p-2 rounded-lg">
            <DollarSign className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-sm font-bold">Pricing & Capacity</CardTitle>
            <CardDescription className="text-xs">Set the enrollment fee and maximum participant slots.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Price */}
          <div className="space-y-2">
            <Label htmlFor="price" className="text-xs font-semibold flex items-center space-x-1.5">
              <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Fee (USD)</span>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-semibold">$</span>
              <Input
                id="price"
                type="number"
                className="h-10 text-sm pl-7"
                {...register("price")}
              />
            </div>
            {errors.price && <p className="text-[11px] text-destructive font-medium">{errors.price.message}</p>}
          </div>

          {/* Max Spots */}
          <div className="space-y-2">
            <Label htmlFor="maxSpots" className="text-xs font-semibold flex items-center space-x-1.5">
              <Ticket className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Max Enrollment Slots</span>
            </Label>
            <Input
              id="maxSpots"
              type="number"
              className="h-10 text-sm"
              {...register("maxSpots")}
            />
            {errors.maxSpots && <p className="text-[11px] text-destructive font-medium">{errors.maxSpots.message}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
