"use client";

import React from "react";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { ShieldCheck, Info } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ProgramFormValues } from "./program-schema";

interface VerificationSectionProps {
  register: UseFormRegister<ProgramFormValues>;
  errors: FieldErrors<ProgramFormValues>;
}

export default function VerificationSection({ register, errors }: VerificationSectionProps) {
  return (
    <Card className="rounded-2xl border-border/40 bg-card overflow-hidden">
      <CardHeader className="bg-muted/30 border-b border-border/30">
        <div className="flex items-center space-x-2.5">
          <div className="bg-emerald-500/10 text-emerald-500 p-2 rounded-lg">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-sm font-bold">Host Verification</CardTitle>
            <CardDescription className="text-xs">Verify program details and agree to review policies before publishing.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        
        {/* Verification Checkbox */}
        <div className="space-y-1">
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="verifiedCorrect"
              className="mt-1 h-4.5 w-4.5 shrink-0 rounded border border-border/80 bg-background/50 focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer transition-all duration-200"
              {...register("verifiedCorrect")}
            />
            <div className="space-y-0.5">
              <Label htmlFor="verifiedCorrect" className="text-xs font-semibold cursor-pointer text-foreground">
                I verify that all provided workshop details are correct.
              </Label>
              <p className="text-[10px] text-muted-foreground">
                I confirm that the syllabus, schedules, prices, venue address, and coach biography details are accurate and comply with the platform instructions.
              </p>
            </div>
          </div>
          {errors.verifiedCorrect && (
            <p className="text-[11px] text-destructive font-medium pl-7.5">{errors.verifiedCorrect.message}</p>
          )}
        </div>

        {/* Policy Checkbox */}
        <div className="space-y-1">
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="acknowledgedPolicy"
              className="mt-1 h-4.5 w-4.5 shrink-0 rounded border border-border/80 bg-background/50 focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer transition-all duration-200"
              {...register("acknowledgedPolicy")}
            />
            <div className="space-y-0.5">
              <Label htmlFor="acknowledgedPolicy" className="text-xs font-semibold cursor-pointer text-foreground">
                I acknowledge the platform review and validation process.
              </Label>
              <p className="text-[10px] text-muted-foreground">
                I understand that this workshop listing will enter a "Pending" validation status and require Super Admin approval before being displayed on the explorer marketplace.
              </p>
            </div>
          </div>
          {errors.acknowledgedPolicy && (
            <p className="text-[11px] text-destructive font-medium pl-7.5">{errors.acknowledgedPolicy.message}</p>
          )}
        </div>

        {/* Info Box */}
        <div className="flex items-start space-x-2 text-[10px] text-amber-600 dark:text-amber-500 bg-amber-500/10 p-3.5 rounded-xl border border-amber-500/20">
          <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          <p>
            Please review the details in the Live Preview column on the right before publishing. Both verification checkmarks are compulsory to proceed.
          </p>
        </div>

      </CardContent>
    </Card>
  );
}
