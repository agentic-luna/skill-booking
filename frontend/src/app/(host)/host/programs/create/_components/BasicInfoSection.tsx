"use client";

import React from "react";
import { UseFormRegister, FieldErrors, UseFormSetValue } from "react-hook-form";
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
    <Card className="rounded-2xl border-border/40 bg-card overflow-hidden">
      <CardHeader className="bg-muted/30 border-b border-border/30">
        <div className="flex items-center space-x-2.5">
          <div className="bg-primary/10 text-primary p-2 rounded-lg">
            <FileText className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-sm font-bold">Basic Information</CardTitle>
            <CardDescription className="text-xs">Title, category, and description of your workshop.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-5">
        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title" className="text-xs font-semibold flex items-center space-x-1.5">
            <Tag className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Workshop Title</span>
          </Label>
          <Input
            id="title"
            placeholder="e.g. Next.js Mastery Bootcamp"
            className="h-10 text-sm"
            {...register("title")}
          />
          {errors.title && <p className="text-[11px] text-destructive font-medium">{errors.title.message}</p>}
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold flex items-center space-x-1.5">
            <Sparkles className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Category Domain</span>
          </Label>
          <Select
            defaultValue={selectedCategory}
            onValueChange={(val: any) => {
              setValue("category", val);
              onCategoryChange(val);
            }}
          >
            <SelectTrigger className="h-10 text-sm">
              <SelectValue placeholder="Select Domain" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {categoryMeta && (
            <div className={`inline-flex items-center text-[10px] font-semibold px-2.5 py-1 rounded-md border ${categoryMeta.color}`}>
              {categoryMeta.label}
            </div>
          )}
          {errors.category && <p className="text-[11px] text-destructive font-medium">{errors.category.message}</p>}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description" className="text-xs font-semibold flex items-center space-x-1.5">
            <FileText className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Syllabus & Description</span>
          </Label>
          <textarea
            id="description"
            rows={5}
            placeholder="Outline the course details, learning objectives, prerequisites, and what students will walk away with..."
            className="flex w-full rounded-xl border border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
            {...register("description")}
          />
          {errors.description && <p className="text-[11px] text-destructive font-medium">{errors.description.message}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
