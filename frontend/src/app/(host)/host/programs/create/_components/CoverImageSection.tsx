"use client";

import React from "react";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { Image as ImageIcon, Info } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProgramFormValues } from "./program-schema";

interface CoverImageSectionProps {
  register: UseFormRegister<ProgramFormValues>;
  errors: FieldErrors<ProgramFormValues>;
}

export default function CoverImageSection({ register, errors }: CoverImageSectionProps) {
  return (
    <Card className="rounded-2xl border-border/40 bg-card overflow-hidden">
      <CardHeader className="bg-muted/30 border-b border-border/30">
        <div className="flex items-center space-x-2.5">
          <div className="bg-cyan-500/10 text-cyan-500 p-2 rounded-lg">
            <ImageIcon className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-sm font-bold">Cover Image</CardTitle>
            <CardDescription className="text-xs">Provide a URL for the workshop banner image.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-3">
        <div className="space-y-2">
          <Label htmlFor="imageUrl" className="text-xs font-semibold flex items-center space-x-1.5">
            <ImageIcon className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Image URL</span>
          </Label>
          <Input
            id="imageUrl"
            type="url"
            placeholder="https://images.unsplash.com/photo-..."
            className="h-10 text-sm"
            {...register("imageUrl")}
          />
          {errors.imageUrl && <p className="text-[11px] text-destructive font-medium">{errors.imageUrl.message}</p>}
        </div>
        <p className="text-[10px] text-muted-foreground flex items-center space-x-1">
          <Info className="h-3 w-3" />
          <span>A valid image URL is required. Recommended size: 1200×630px.</span>
        </p>
      </CardContent>
    </Card>
  );
}
