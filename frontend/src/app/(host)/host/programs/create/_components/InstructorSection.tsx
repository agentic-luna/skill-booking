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
    <Card className="rounded-[24px] border-none shadow-sm hover:shadow-md transition-all duration-300 bg-white overflow-hidden">
      <CardHeader className="bg-transparent border-b border-gray-100/50 pb-5 pt-6">
        <div className="flex items-center space-x-3.5">
          <div>
            <CardTitle className="text-[17px] font-extrabold text-gray-900">Instructor Details</CardTitle>
            <CardDescription className="text-[13px] text-gray-500 font-medium">Provide the profile details and social links of the class instructor.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-7 space-y-7">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Instructor Name */}
          <div className="space-y-2.5">
            <Label htmlFor="instructorName" className="text-[13px] font-bold text-gray-700 flex items-center space-x-1.5">
              <User className="h-4 w-4 text-gray-400" />
              <span>Instructor Name</span>
            </Label>
            <Input
              id="instructorName"
              placeholder="e.g. Dr. Jane Doe"
              className="h-11 text-[14px] bg-emerald-50/30 border-emerald-100 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-600 hover:border-emerald-300 transition-all rounded-xl shadow-sm hover:shadow-md hover:shadow-emerald-900/5"
              {...register("instructorName")}
            />
            {errors.instructorName && <p className="text-[12px] text-red-500 font-semibold">{errors.instructorName.message}</p>}
          </div>

          {/* Company Name */}
          <div className="space-y-2.5">
            <Label htmlFor="companyName" className="text-[13px] font-bold text-gray-700 flex items-center space-x-1.5">
              <FileText className="h-4 w-4 text-gray-400" />
              <span>Company Name</span>
            </Label>
            <Input
              id="companyName"
              placeholder="e.g. Acme Corporation"
              className="h-11 text-[14px] bg-emerald-50/30 border-emerald-100 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-600 hover:border-emerald-300 transition-all rounded-xl shadow-sm hover:shadow-md hover:shadow-emerald-900/5"
              {...register("companyName")}
            />
            {errors.companyName && <p className="text-[12px] text-red-500 font-semibold">{errors.companyName.message}</p>}
          </div>

          {/* Instructor Photo */}
          <div className="space-y-2.5">
            <Label htmlFor="instructorPhoto" className="text-[13px] font-bold text-gray-700 flex items-center space-x-1.5">
              <ImageIcon className="h-4 w-4 text-gray-400" />
              <span>Profile Photo URL</span>
            </Label>
            <Input
              id="instructorPhoto"
              type="url"
              placeholder="https://images.unsplash.com/photo-..."
              className="h-11 text-[14px] bg-emerald-50/30 border-emerald-100 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-600 hover:border-emerald-300 transition-all rounded-xl shadow-sm hover:shadow-md hover:shadow-emerald-900/5"
              {...register("instructorPhoto")}
            />
            {errors.instructorPhoto && <p className="text-[12px] text-red-500 font-semibold">{errors.instructorPhoto.message}</p>}
          </div>
        </div>

        {/* Instructor Bio */}
        <div className="space-y-2.5">
          <Label htmlFor="instructorBio" className="text-[13px] font-bold text-gray-700 flex items-center space-x-1.5">
            <FileText className="h-4 w-4 text-gray-400" />
            <span>Instructor Biography</span>
          </Label>
          <textarea
            id="instructorBio"
            rows={4}
            placeholder="Introduce the instructor's background, achievements, and teaching credentials..."
            className="flex min-h-[100px] w-full rounded-xl border border-emerald-100 bg-emerald-50/30 px-4 py-3 text-[14px] leading-relaxed ring-offset-background placeholder:text-gray-400 focus-visible:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-600 hover:border-emerald-300 transition-all shadow-sm hover:shadow-md hover:shadow-emerald-900/5 resize-none disabled:cursor-not-allowed disabled:opacity-50"
            {...register("instructorBio")}
          />
          {errors.instructorBio && <p className="text-[12px] text-red-500 font-semibold">{errors.instructorBio.message}</p>}
        </div>

        {/* Social Links */}
        <div className="pt-5 border-t border-gray-100/60 space-y-5">
          <h4 className="text-[14px] font-bold text-gray-900">Social Profiles (Optional)</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Instagram */}
            <div className="space-y-2.5">
              <Label htmlFor="instagram" className="text-[13px] font-bold text-gray-700 flex items-center space-x-1.5">
                <Instagram className="h-4 w-4 text-pink-500" />
                <span>Instagram URL</span>
              </Label>
              <Input
                id="instagram"
                type="url"
                placeholder="https://instagram.com/..."
                className="h-11 text-[14px] bg-emerald-50/30 border-emerald-100 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-pink-500/10 focus-visible:border-pink-500 transition-all rounded-xl shadow-sm"
                {...register("instagram")}
              />
              {errors.instagram && <p className="text-[12px] text-red-500 font-semibold">{errors.instagram.message}</p>}
            </div>

            {/* LinkedIn */}
            <div className="space-y-2.5">
              <Label htmlFor="linkedin" className="text-[13px] font-bold text-gray-700 flex items-center space-x-1.5">
                <Linkedin className="h-4 w-4 text-blue-500" />
                <span>LinkedIn URL</span>
              </Label>
              <Input
                id="linkedin"
                type="url"
                placeholder="https://linkedin.com/in/..."
                className="h-11 text-[14px] bg-emerald-50/30 border-emerald-100 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-600 hover:border-emerald-300 transition-all rounded-xl shadow-sm hover:shadow-md hover:shadow-emerald-900/5"
                {...register("linkedin")}
              />
              {errors.linkedin && <p className="text-[12px] text-red-500 font-semibold">{errors.linkedin.message}</p>}
            </div>

            {/* Facebook */}
            <div className="space-y-2.5">
              <Label htmlFor="facebook" className="text-[13px] font-bold text-gray-700 flex items-center space-x-1.5">
                <Facebook className="h-4 w-4 text-blue-600" />
                <span>Facebook URL</span>
              </Label>
              <Input
                id="facebook"
                type="url"
                placeholder="https://facebook.com/..."
                className="h-11 text-[14px] bg-emerald-50/30 border-emerald-100 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-600 hover:border-emerald-300 transition-all rounded-xl shadow-sm hover:shadow-md hover:shadow-emerald-900/5"
                {...register("facebook")}
              />
              {errors.facebook && <p className="text-[12px] text-red-500 font-semibold">{errors.facebook.message}</p>}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
