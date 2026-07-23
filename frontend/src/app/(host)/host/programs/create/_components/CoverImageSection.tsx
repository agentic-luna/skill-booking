"use client";

import React from "react";
import { UseFormRegister, FieldErrors, Control, useFieldArray } from "react-hook-form";
import { Image as ImageIcon, Info, Plus, Trash2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ProgramFormValues } from "./program-schema";

interface CoverImageSectionProps {
  register: UseFormRegister<ProgramFormValues>;
  errors: FieldErrors<ProgramFormValues>;
  control: Control<ProgramFormValues>;
}

export default function CoverImageSection({ register, errors, control }: CoverImageSectionProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "additionalImages",
  });

  return (
    <Card className="rounded-[24px] border-none shadow-sm hover:shadow-md transition-all duration-300 bg-white overflow-hidden">
      <CardHeader className="bg-transparent border-b border-gray-100/50 pb-5 pt-6">
        <div className="flex items-center space-x-3.5">
          <div>
            <CardTitle className="text-[17px] font-extrabold text-gray-900">Images</CardTitle>
            <CardDescription className="text-[13px] text-gray-500 font-medium">Provide URLs for the workshop banner and additional images.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-7 space-y-7">
        <div className="space-y-2.5">
          <Label htmlFor="imageUrl" className="text-[13px] font-bold text-gray-700 flex items-center space-x-1.5">
            <ImageIcon className="h-4 w-4 text-gray-400" />
            <span>Main Cover Image URL</span>
          </Label>
          <Input
            id="imageUrl"
            type="url"
            placeholder="https://images.unsplash.com/photo-..."
            className="h-11 text-[14px] bg-emerald-50/30 border-emerald-100 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-600 hover:border-emerald-300 transition-all rounded-xl shadow-sm hover:shadow-md hover:shadow-emerald-900/5"
            {...register("imageUrl")}
          />
          {errors.imageUrl && <p className="text-[12px] text-red-500 font-semibold">{errors.imageUrl.message}</p>}
        </div>

        <div className="space-y-4 pt-2">
          <Label className="text-[13px] font-bold text-gray-700 flex items-center space-x-1.5">
            <ImageIcon className="h-4 w-4 text-gray-400" />
            <span>Additional Images (Optional)</span>
          </Label>
          
          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-3 items-start animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex-1 space-y-1">
                <Input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  className="h-11 text-[14px] bg-emerald-50/30 border-emerald-100 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-600 hover:border-emerald-300 transition-all rounded-xl shadow-sm hover:shadow-md hover:shadow-emerald-900/5"
                  {...register(`additionalImages.${index}.url` as const)}
                />
                {errors.additionalImages?.[index]?.url && (
                  <p className="text-[12px] text-red-500 font-semibold">
                    {errors.additionalImages[index]?.url?.message}
                  </p>
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => remove(index)}
                className="h-11 w-11 shrink-0 rounded-xl text-red-500 border-red-200 bg-red-50 hover:bg-red-100 hover:border-red-300 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={() => append({ url: "" })}
            className="w-full border-dashed border-2 border-gray-200 h-12 text-[13px] font-bold rounded-xl flex items-center justify-center text-gray-500 hover:text-gray-900 hover:border-gray-300 hover:bg-gray-50 transition-all"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Another Image
          </Button>
        </div>

        <p className="text-[10px] text-muted-foreground flex items-center space-x-1">
          <Info className="h-3 w-3" />
          <span>Valid image URLs are required. Recommended size: 1200×630px.</span>
        </p>
      </CardContent>
    </Card>
  );
}
