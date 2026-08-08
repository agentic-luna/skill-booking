"use client";

import React, { useEffect, useRef } from "react";
import { UseFormRegister, FieldErrors, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { FileText, Tag, Sparkles, HelpCircle } from "lucide-react";

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

        {/* Course Questionnaire (FAQ) */}
        <div className="border-t border-gray-100/80 pt-6 mt-6 space-y-6">
          <div>
            <h3 className="text-[15px] font-extrabold text-gray-900 flex items-center space-x-2">
              <span className="p-1.5 bg-emerald-50 rounded-lg text-emerald-600">
                <HelpCircle className="h-4.5 w-4.5" />
              </span>
              <span>Course Questionnaire (FAQ)</span>
            </h3>
            <p className="text-[12px] text-gray-500 font-medium mt-1">
              Provide specific details about your workshop. Mandatory questions are marked with an asterisk (*).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. What Is This Program? */}
            <div className="space-y-2">
              <Label htmlFor="questionnaire.whatIsThisProgram" className="text-[13px] font-bold text-gray-700 flex items-center space-x-1.5">
                <span>1. What Is This Program? *</span>
              </Label>
              <textarea
                id="questionnaire.whatIsThisProgram"
                rows={2}
                placeholder="e.g. An intensive hands-on bootcamp designed to build production-ready applications using Next.js."
                className="flex w-full rounded-xl border border-emerald-100 bg-emerald-50/30 px-4 py-2.5 text-[13px] leading-relaxed placeholder:text-gray-400 focus-visible:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-600 hover:border-emerald-300 transition-all shadow-sm resize-none"
                {...register("questionnaire.whatIsThisProgram")}
              />
              {errors.questionnaire?.whatIsThisProgram && (
                <p className="text-[11px] text-red-500 font-semibold">{errors.questionnaire.whatIsThisProgram.message}</p>
              )}
            </div>

            {/* 2. Who Is This Training/Course For? */}
            <div className="space-y-2">
              <Label htmlFor="questionnaire.whoIsThisFor" className="text-[13px] font-bold text-gray-700 flex items-center space-x-1.5">
                <span>2. Who Is This Training/Course For? *</span>
              </Label>
              <textarea
                id="questionnaire.whoIsThisFor"
                rows={2}
                placeholder="e.g. Frontend developers, hobbyists, or computer science students wanting to master React frameworks."
                className="flex w-full rounded-xl border border-emerald-100 bg-emerald-50/30 px-4 py-2.5 text-[13px] leading-relaxed placeholder:text-gray-400 focus-visible:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-600 hover:border-emerald-300 transition-all shadow-sm resize-none"
                {...register("questionnaire.whoIsThisFor")}
              />
              {errors.questionnaire?.whoIsThisFor && (
                <p className="text-[11px] text-red-500 font-semibold">{errors.questionnaire.whoIsThisFor.message}</p>
              )}
            </div>

            {/* 3. What Will You Learn? */}
            <div className="space-y-2">
              <Label htmlFor="questionnaire.whatWillYouLearn" className="text-[13px] font-bold text-gray-700 flex items-center space-x-1.5">
                <span>3. What Will You Learn? *</span>
              </Label>
              <textarea
                id="questionnaire.whatWillYouLearn"
                rows={2}
                placeholder="e.g. App router, Server actions, Server-side rendering, caching strategies, and database integrations."
                className="flex w-full rounded-xl border border-emerald-100 bg-emerald-50/30 px-4 py-2.5 text-[13px] leading-relaxed placeholder:text-gray-400 focus-visible:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-600 hover:border-emerald-300 transition-all shadow-sm resize-none"
                {...register("questionnaire.whatWillYouLearn")}
              />
              {errors.questionnaire?.whatWillYouLearn && (
                <p className="text-[11px] text-red-500 font-semibold">{errors.questionnaire.whatWillYouLearn.message}</p>
              )}
            </div>

            {/* 4. What topics we will be teaching? */}
            <div className="space-y-2">
              <Label htmlFor="questionnaire.whatTopics" className="text-[13px] font-bold text-gray-700 flex items-center space-x-1.5">
                <span>4. What topics we will be teaching? *</span>
              </Label>
              <textarea
                id="questionnaire.whatTopics"
                rows={2}
                placeholder="e.g. React Server Components, routing mechanisms, middleware authentication, Prisma ORM, deployment on Vercel."
                className="flex w-full rounded-xl border border-emerald-100 bg-emerald-50/30 px-4 py-2.5 text-[13px] leading-relaxed placeholder:text-gray-400 focus-visible:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-600 hover:border-emerald-300 transition-all shadow-sm resize-none"
                {...register("questionnaire.whatTopics")}
              />
              {errors.questionnaire?.whatTopics && (
                <p className="text-[11px] text-red-500 font-semibold">{errors.questionnaire.whatTopics.message}</p>
              )}
            </div>

            {/* 5. Medium of Language */}
            <div className="space-y-2">
              <Label htmlFor="questionnaire.mediumOfLanguage" className="text-[13px] font-bold text-gray-700 flex items-center space-x-1.5">
                <span>5. Medium of Language *</span>
              </Label>
              <Input
                id="questionnaire.mediumOfLanguage"
                placeholder="e.g. English, Malayalam, Tamil, Kannada, Telugu, Hindi etc."
                className="h-10 text-[13px] bg-emerald-50/30 border-emerald-100 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-600 hover:border-emerald-300 transition-all rounded-xl shadow-sm"
                {...register("questionnaire.mediumOfLanguage")}
              />
              {errors.questionnaire?.mediumOfLanguage && (
                <p className="text-[11px] text-red-500 font-semibold">{errors.questionnaire.mediumOfLanguage.message}</p>
              )}
            </div>

            {/* 6. Prerequisites */}
            <div className="space-y-2">
              <Label htmlFor="questionnaire.prerequisites" className="text-[13px] font-bold text-gray-700 flex items-center space-x-1.5">
                <span>6. Prerequisites (Optional)</span>
              </Label>
              <Input
                id="questionnaire.prerequisites"
                placeholder="e.g. Basic familiarity with JavaScript and HTML/CSS."
                className="h-10 text-[13px] bg-emerald-50/30 border-emerald-100 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-600 hover:border-emerald-300 transition-all rounded-xl shadow-sm"
                {...register("questionnaire.prerequisites")}
              />
              {errors.questionnaire?.prerequisites && (
                <p className="text-[11px] text-red-500 font-semibold">{errors.questionnaire.prerequisites.message}</p>
              )}
            </div>

            {/* 7. Takeaways */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="questionnaire.takeaways" className="text-[13px] font-bold text-gray-700 flex items-center space-x-1.5">
                <span>7. Takeaways (Optional)</span>
              </Label>
              <textarea
                id="questionnaire.takeaways"
                rows={2}
                placeholder="e.g. Course completion certificate, downloadable Figma design assets, marketing plan templates, GitHub codebase access."
                className="flex w-full rounded-xl border border-emerald-100 bg-emerald-50/30 px-4 py-2.5 text-[13px] leading-relaxed placeholder:text-gray-400 focus-visible:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-600 hover:border-emerald-300 transition-all shadow-sm resize-none"
                {...register("questionnaire.takeaways")}
              />
              {errors.questionnaire?.takeaways && (
                <p className="text-[11px] text-red-500 font-semibold">{errors.questionnaire.takeaways.message}</p>
              )}
            </div>

            {/* 8. What tools you will be given? */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="questionnaire.toolsGiven" className="text-[13px] font-bold text-gray-700 flex items-center space-x-1.5">
                <span>8. What tools you will be given? (Optional)</span>
              </Label>
              <textarea
                id="questionnaire.toolsGiven"
                rows={2}
                placeholder="e.g. 20 Spreadsheet templates, 1000 AI prompts, boilerplate repo, cloud deployment guides etc."
                className="flex w-full rounded-xl border border-emerald-100 bg-emerald-50/30 px-4 py-2.5 text-[13px] leading-relaxed placeholder:text-gray-400 focus-visible:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-600 hover:border-emerald-300 transition-all shadow-sm resize-none"
                {...register("questionnaire.toolsGiven")}
              />
              {errors.questionnaire?.toolsGiven && (
                <p className="text-[11px] text-red-500 font-semibold">{errors.questionnaire.toolsGiven.message}</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
