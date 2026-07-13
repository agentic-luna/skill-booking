"use client";

import React from "react";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { User, FileText, Image as ImageIcon, Instagram, Linkedin, Facebook } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProgramFormValues } from "./program-schema";

interface InstructorSectionProps {
  register: UseFormRegister<ProgramFormValues>;
  errors: FieldErrors<ProgramFormValues>;
}

export default function InstructorSection({ register, errors }: InstructorSectionProps) {
  return (
    <Card className="rounded-2xl border-border/40 bg-card overflow-hidden">
      <CardHeader className="bg-muted/30 border-b border-border/30">
        <div className="flex items-center space-x-2.5">
          <div className="bg-violet-500/10 text-violet-500 p-2 rounded-lg">
            <User className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-sm font-bold">Instructor Details</CardTitle>
            <CardDescription className="text-xs">Provide the profile details and social links of the class instructor.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Instructor Name */}
          <div className="space-y-2">
            <Label htmlFor="instructorName" className="text-xs font-semibold flex items-center space-x-1.5">
              <User className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Instructor Name</span>
            </Label>
            <Input
              id="instructorName"
              placeholder="e.g. Dr. Jane Doe"
              className="h-10 text-sm"
              {...register("instructorName")}
            />
            {errors.instructorName && <p className="text-[11px] text-destructive font-medium">{errors.instructorName.message}</p>}
          </div>

          {/* Company Name */}
          <div className="space-y-2">
            <Label htmlFor="companyName" className="text-xs font-semibold flex items-center space-x-1.5">
              <FileText className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Company Name</span>
            </Label>
            <Input
              id="companyName"
              placeholder="e.g. Acme Corporation"
              className="h-10 text-sm"
              {...register("companyName")}
            />
            {errors.companyName && <p className="text-[11px] text-destructive font-medium">{errors.companyName.message}</p>}
          </div>

          {/* Instructor Photo */}
          <div className="space-y-2">
            <Label htmlFor="instructorPhoto" className="text-xs font-semibold flex items-center space-x-1.5">
              <ImageIcon className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Profile Photo URL</span>
            </Label>
            <Input
              id="instructorPhoto"
              type="url"
              placeholder="https://images.unsplash.com/photo-..."
              className="h-10 text-sm"
              {...register("instructorPhoto")}
            />
            {errors.instructorPhoto && <p className="text-[11px] text-destructive font-medium">{errors.instructorPhoto.message}</p>}
          </div>
        </div>

        {/* Instructor Bio */}
        <div className="space-y-2">
          <Label htmlFor="instructorBio" className="text-xs font-semibold flex items-center space-x-1.5">
            <FileText className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Instructor Biography</span>
          </Label>
          <textarea
            id="instructorBio"
            rows={4}
            placeholder="Introduce the instructor's background, achievements, and teaching credentials..."
            className="flex min-h-[90px] w-full rounded-xl border border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
            {...register("instructorBio")}
          />
          {errors.instructorBio && <p className="text-[11px] text-destructive font-medium">{errors.instructorBio.message}</p>}
        </div>

        {/* Social Links */}
        <div className="pt-2 border-t border-border/30 space-y-4">
          <h4 className="text-xs font-bold text-foreground">Social Profiles (Optional)</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Instagram */}
            <div className="space-y-2">
              <Label htmlFor="instagram" className="text-[11px] font-semibold flex items-center space-x-1.5">
                <Instagram className="h-3.5 w-3.5 text-pink-500" />
                <span>Instagram URL</span>
              </Label>
              <Input
                id="instagram"
                type="url"
                placeholder="https://instagram.com/..."
                className="h-9 text-xs"
                {...register("instagram")}
              />
              {errors.instagram && <p className="text-[10px] text-destructive font-medium">{errors.instagram.message}</p>}
            </div>

            {/* LinkedIn */}
            <div className="space-y-2">
              <Label htmlFor="linkedin" className="text-[11px] font-semibold flex items-center space-x-1.5">
                <Linkedin className="h-3.5 w-3.5 text-blue-500" />
                <span>LinkedIn URL</span>
              </Label>
              <Input
                id="linkedin"
                type="url"
                placeholder="https://linkedin.com/in/..."
                className="h-9 text-xs"
                {...register("linkedin")}
              />
              {errors.linkedin && <p className="text-[10px] text-destructive font-medium">{errors.linkedin.message}</p>}
            </div>

            {/* Facebook */}
            <div className="space-y-2">
              <Label htmlFor="facebook" className="text-[11px] font-semibold flex items-center space-x-1.5">
                <Facebook className="h-3.5 w-3.5 text-blue-600" />
                <span>Facebook URL</span>
              </Label>
              <Input
                id="facebook"
                type="url"
                placeholder="https://facebook.com/..."
                className="h-9 text-xs"
                {...register("facebook")}
              />
              {errors.facebook && <p className="text-[10px] text-destructive font-medium">{errors.facebook.message}</p>}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
