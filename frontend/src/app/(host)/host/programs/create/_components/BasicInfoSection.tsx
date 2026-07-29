"use client";

import React from "react";
import { UseFormRegister, FieldErrors, UseFormSetValue } from "react-hook-form";
import { FileText, Tag, Sparkles, Youtube } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CATEGORIES, ProgramFormValues, CategoryMeta } from "./program-schema";

interface BasicInfoSectionProps {
  register: UseFormRegister<ProgramFormValues>;
  errors: FieldErrors<ProgramFormValues>;
  setValue: UseFormSetValue<ProgramFormValues>;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  categoryMeta: CategoryMeta | undefined;
}

export default function BasicInfoSection({
  register,
  errors,
  setValue,
  selectedCategory,
  onCategoryChange,
  categoryMeta,
}: BasicInfoSectionProps) {
  return (
    <Card className="rounded-[24px] border-none shadow-sm hover:shadow-md transition-all duration-300 bg-white overflow-hidden">
      <CardHeader className="bg-transparent border-b border-gray-100/50 pb-5 pt-6">
        <div className="flex items-center space-x-3.5">
          <div>
            <CardTitle className="text-[17px] font-extrabold text-gray-900">Basic Information</CardTitle>
            <CardDescription className="text-[13px] text-gray-500 font-medium">Title, category, and description of your workshop.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-7 space-y-7">
        {/* Title */}
        <div className="space-y-2.5">
          <Label htmlFor="title" className="text-[13px] font-bold text-gray-700 flex items-center space-x-1.5">
            <Tag className="h-4 w-4 text-gray-400" />
            <span>Workshop Title</span>
          </Label>
          <Input
            id="title"
            placeholder="e.g. Next.js Mastery Bootcamp"
            className="h-11 text-[14px] bg-emerald-50/30 border-emerald-100 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-600 hover:border-emerald-300 transition-all rounded-xl shadow-sm hover:shadow-md hover:shadow-emerald-900/5"
            {...register("title")}
          />
          {errors.title && <p className="text-[12px] text-red-500 font-semibold">{errors.title.message}</p>}
        </div>

        {/* Category */}
        <div className="space-y-2.5">
          <Label className="text-[13px] font-bold text-gray-700 flex items-center space-x-1.5">
            <Sparkles className="h-4 w-4 text-gray-400" />
            <span>Category Domain</span>
          </Label>
          <Select
            defaultValue={selectedCategory}
            onValueChange={(val: any) => {
              setValue("category", val);
              onCategoryChange(val);
            }}
          >
            <SelectTrigger className="h-11 text-[14px] bg-emerald-50/30 border-emerald-100 focus:bg-white focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-600 hover:border-emerald-300 transition-all rounded-xl shadow-sm hover:shadow-md hover:shadow-emerald-900/5">
              <SelectValue placeholder="Select Domain" />
            </SelectTrigger>
            <SelectContent className="rounded-xl shadow-xl border-gray-100">
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value} className="text-[13px] font-medium">{cat.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {categoryMeta && (
            <div className={`inline-flex items-center text-[11px] font-bold px-3 py-1.5 rounded-lg border shadow-sm mt-1 ${categoryMeta.color}`}>
              {categoryMeta.label}
            </div>
          )}
          {errors.category && <p className="text-[12px] text-red-500 font-semibold">{errors.category.message}</p>}
        </div>

        {/* Description */}
        <div className="space-y-2.5">
          <Label htmlFor="description" className="text-[13px] font-bold text-gray-700 flex items-center space-x-1.5">
            <FileText className="h-4 w-4 text-gray-400" />
            <span>Syllabus & Description</span>
          </Label>
          <textarea
            id="description"
            rows={4}
            placeholder="Outline the course details, learning objectives, prerequisites, and what students will walk away with..."
            className="flex w-full rounded-xl border border-emerald-100 bg-emerald-50/30 px-4 py-3 text-[14px] leading-relaxed ring-offset-background placeholder:text-gray-400 focus-visible:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-600 hover:border-emerald-300 transition-all shadow-sm hover:shadow-md hover:shadow-emerald-900/5 resize-none disabled:cursor-not-allowed disabled:opacity-50"
            {...register("description")}
          />
          {errors.description && <p className="text-[12px] text-red-500 font-semibold">{errors.description.message}</p>}
        </div>

        {/* Video URL */}
        <div className="space-y-2.5">
          <Label htmlFor="videoUrl1" className="text-[13px] font-bold text-gray-700 flex items-center space-x-1.5">
            <Youtube size={16} className="text-red-500" />
            <span>YouTube Video URL 1 (Optional)</span>
          </Label>
          <Input
            id="videoUrl1"
            placeholder="https://www.youtube.com/watch?v=..."
            className="h-11 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
            {...register("videoUrl1")}
          />
          {errors.videoUrl1 && <p className="text-[12px] text-red-500 font-semibold">{errors.videoUrl1.message}</p>}
        </div>

        <div className="space-y-2.5">
          <Label htmlFor="videoUrl2" className="text-[13px] font-bold text-gray-700 flex items-center space-x-1.5">
            <Youtube size={16} className="text-red-500" />
            <span>YouTube Video URL 2 (Optional)</span>
          </Label>
          <Input
            id="videoUrl2"
            placeholder="https://www.youtube.com/watch?v=..."
            className="h-11 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
            {...register("videoUrl2")}
          />
          {errors.videoUrl2 && <p className="text-[12px] text-red-500 font-semibold">{errors.videoUrl2.message}</p>}
        </div>

        <div className="space-y-2.5">
          <Label htmlFor="videoUrl3" className="text-[13px] font-bold text-gray-700 flex items-center space-x-1.5">
            <Youtube size={16} className="text-red-500" />
            <span>YouTube Video URL 3 (Optional)</span>
          </Label>
          <Input
            id="videoUrl3"
            placeholder="https://www.youtube.com/watch?v=..."
            className="h-11 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
            {...register("videoUrl3")}
          />
          {errors.videoUrl3 && <p className="text-[12px] text-red-500 font-semibold">{errors.videoUrl3.message}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
