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
    <Card className="rounded-[24px] border-none shadow-sm hover:shadow-md transition-all duration-300 bg-white overflow-hidden">
      <CardHeader className="bg-transparent border-b border-gray-100/50 pb-5 pt-6">
        <div className="flex items-center space-x-3.5">
          <div>
            <CardTitle className="text-[17px] font-extrabold text-gray-900">Host Verification</CardTitle>
            <CardDescription className="text-[13px] text-gray-500 font-medium">Verify program details and agree to review policies before publishing.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-7 space-y-6">
        
        {/* Verification Checkbox */}
        <div className="space-y-1 bg-gray-50/50 p-5 rounded-[16px] border border-gray-200/50 transition-all hover:bg-white hover:shadow-sm">
          <div className="flex items-start space-x-3.5">
            <input
              type="checkbox"
              id="verifiedCorrect"
              className="mt-0.5 h-5 w-5 shrink-0 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer transition-all duration-200"
              {...register("verifiedCorrect")}
            />
            <div className="space-y-1">
              <Label htmlFor="verifiedCorrect" className="text-[14px] font-bold cursor-pointer text-gray-900 leading-none">
                I verify that all provided workshop details are correct.
              </Label>
              <p className="text-[13px] text-gray-500 leading-relaxed">
                I confirm that the syllabus, schedules, prices, venue address, and coach biography details are accurate and comply with the platform instructions.
              </p>
            </div>
          </div>
          {errors.verifiedCorrect && (
            <p className="text-[12px] text-red-500 font-semibold pl-8">{errors.verifiedCorrect.message}</p>
          )}
        </div>

        {/* Policy Checkbox */}
        <div className="space-y-1 bg-gray-50/50 p-5 rounded-[16px] border border-gray-200/50 transition-all hover:bg-white hover:shadow-sm">
          <div className="flex items-start space-x-3.5">
            <input
              type="checkbox"
              id="acknowledgedPolicy"
              className="mt-0.5 h-5 w-5 shrink-0 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer transition-all duration-200"
              {...register("acknowledgedPolicy")}
            />
            <div className="space-y-1">
              <Label htmlFor="acknowledgedPolicy" className="text-[14px] font-bold cursor-pointer text-gray-900 leading-none">
                I acknowledge the platform review and validation process.
              </Label>
              <p className="text-[13px] text-gray-500 leading-relaxed">
                I understand that this workshop listing will enter a "Pending" validation status and require Super Admin approval before being displayed on the explorer marketplace.
              </p>
            </div>
          </div>
          {errors.acknowledgedPolicy && (
            <p className="text-[12px] text-red-500 font-semibold pl-8">{errors.acknowledgedPolicy.message}</p>
          )}
        </div>

        {/* Info Box */}
        <div className="flex items-start space-x-3 text-[13px] font-medium text-amber-700 bg-amber-50/80 p-5 rounded-[16px] border border-amber-200/50">
          <Info className="h-5 w-5 shrink-0 text-amber-500" />
          <p className="leading-relaxed">
            Please review the details in the Live Preview column on the right before publishing. Both verification checkmarks are compulsory to proceed.
          </p>
        </div>

      </CardContent>
    </Card>
  );
}
