"use client";

import React, { useEffect, useRef } from "react";
import { UseFormRegister, FieldErrors, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { FileText, Tag, Sparkles } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CATEGORIES, ProgramFormValues, CategoryMeta } from "./program-schema";

interface BasicInfoSectionProps {
  register: UseFormRegister<ProgramFormValues>;
  errors: FieldErrors<ProgramFormValues>;
  setValue: UseFormSetValue<ProgramFormValues>;
  watch?: UseFormWatch<ProgramFormValues>;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  categoryMeta: CategoryMeta | undefined;
}

export default function BasicInfoSection({
  register,
  errors,
  setValue,
  watch,
  selectedCategory,
  onCategoryChange,
  categoryMeta,
}: BasicInfoSectionProps) {
  const selectedKeywords: string[] = watch ? (watch("keywords") || []) : [];

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const { ref: registerRef, onChange: onDescriptionChange, ...restDescription } = register("description");

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onDescriptionChange(e);
    if (e.target) {
      e.target.style.height = "auto";
      e.target.style.height = `${e.target.scrollHeight}px`;
    }
  };

  const watchedDescription = watch ? watch("description") : "";
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [watchedDescription]);

  const toggleKeyword = (kw: string) => {
    if (!setValue) return;
    const current = [...selectedKeywords];
    const index = current.indexOf(kw);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(kw);
    }
    setValue("keywords", current, { shouldValidate: true });
  };
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

        {/* Search Keywords & Sub-Types */}
        {categoryMeta && categoryMeta.keywords && categoryMeta.keywords.length > 0 && (
          <div className="space-y-3 bg-gray-50/60 p-4 rounded-2xl border border-gray-100">
            <Label className="text-[12px] font-extrabold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5 text-gray-400" />
              <span>Target Topics / Keywords ({categoryMeta.label})</span>
            </Label>
            <p className="text-[11px] text-gray-500 font-medium">Select relevant tags to help learners discover your workshop in searches:</p>
            <div className="flex flex-wrap gap-2 pt-1">
              {categoryMeta.keywords.map((kw) => {
                const isSelected = selectedKeywords.includes(kw);
                return (
                  <button
                    key={kw}
                    type="button"
                    onClick={() => toggleKeyword(kw)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all duration-200 shadow-2xs ${
                      isSelected
                        ? "bg-[#0b0c01] text-[#a0f212] border-[#0b0c01] shadow-sm"
                        : "bg-white text-gray-700 border-gray-200 hover:border-gray-400 hover:bg-gray-50"
                    }`}
                  >
                    {isSelected ? "✓ " : "+ "}{kw}
                  </button>
                );
              })}
            </div>
          </div>
        )}

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
            className="flex w-full rounded-xl border border-emerald-100 bg-emerald-50/30 px-4 py-3 text-[14px] leading-relaxed ring-offset-background placeholder:text-gray-400 focus-visible:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-600 hover:border-emerald-300 transition-all shadow-sm hover:shadow-md hover:shadow-emerald-900/5 resize-none disabled:cursor-not-allowed disabled:opacity-50 overflow-hidden"
            {...restDescription}
            onChange={handleInput}
            ref={(el) => {
              registerRef(el);
              textareaRef.current = el;
            }}
          />
          {errors.description && <p className="text-[12px] text-red-500 font-semibold">{errors.description.message}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
