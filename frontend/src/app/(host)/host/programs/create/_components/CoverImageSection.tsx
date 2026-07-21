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
    <Card className="rounded-2xl border-border/40 bg-card overflow-hidden">
      <CardHeader className="bg-muted/30 border-b border-border/30">
        <div className="flex items-center space-x-2.5">
          <div className="bg-cyan-500/10 text-cyan-500 p-2 rounded-lg">
            <ImageIcon className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-sm font-bold">Images</CardTitle>
            <CardDescription className="text-xs">Provide URLs for the workshop banner and additional images.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="imageUrl" className="text-xs font-semibold flex items-center space-x-1.5">
            <ImageIcon className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Main Cover Image URL</span>
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

        <div className="space-y-4">
          <Label className="text-xs font-semibold flex items-center space-x-1.5">
            <ImageIcon className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Additional Images (Optional)</span>
          </Label>
          
          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-2 items-start">
              <div className="flex-1 space-y-1">
                <Input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  className="h-10 text-sm"
                  {...register(`additionalImages.${index}.url` as const)}
                />
                {errors.additionalImages?.[index]?.url && (
                  <p className="text-[11px] text-destructive font-medium">
                    {errors.additionalImages[index]?.url?.message}
                  </p>
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => remove(index)}
                className="h-10 w-10 shrink-0 text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={() => append({ url: "" })}
            className="w-full border-dashed border-2 h-10 text-xs flex items-center justify-center text-muted-foreground hover:text-foreground"
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
