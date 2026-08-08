"use client";

import React from "react";
import { UseFormRegister, FieldErrors, Control, useFieldArray, UseFormSetValue } from "react-hook-form";
import { Image as ImageIcon, Info, Plus, Trash2, Youtube, Upload } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ProgramFormValues } from "./program-schema";

interface CoverImageSectionProps {
  register: UseFormRegister<ProgramFormValues>;
  errors: FieldErrors<ProgramFormValues>;
  control: Control<ProgramFormValues>;
  setValue: UseFormSetValue<ProgramFormValues>;
}

export default function CoverImageSection({ register, errors, control, setValue }: CoverImageSectionProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "additionalImages",
  });

  const [uploadOpen, setUploadOpen] = React.useState(false);
  const [uploadTarget, setUploadTarget] = React.useState<"main" | number | null>(null);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [dragActive, setDragActive] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("image/")) {
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith("image/")) {
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
      }
    }
  };

  const handleUploadClick = (target: "main" | number) => {
    setUploadTarget(target);
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadOpen(true);
  };

  const handleConfirmUpload = () => {
    if (!selectedFile) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        const MAX_SIZE = 1200;
        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL("image/jpeg", 0.75);

          if (uploadTarget === "main") {
            setValue("imageUrl", compressedBase64, { shouldValidate: true });
          } else if (typeof uploadTarget === "number") {
            setValue(`additionalImages.${uploadTarget}.url` as const, compressedBase64, { shouldValidate: true });
          }
        }
        setUploadOpen(false);
        setSelectedFile(null);
        setPreviewUrl(null);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(selectedFile);
  };

  return (
    <>
      <Card className="rounded-[24px] border-none shadow-sm hover:shadow-md transition-all duration-300 bg-white overflow-hidden">
        <CardHeader className="bg-transparent border-b border-gray-100/50 pb-5 pt-6">
          <div className="flex items-center space-x-3.5">
            <div>
              <CardTitle className="text-[17px] font-extrabold text-gray-900">Media</CardTitle>
              <CardDescription className="text-[13px] text-gray-500 font-medium">Provide URLs for the workshop banner, additional images, and YouTube videos.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-7 space-y-7">
          {/* Main Cover Image */}
          <div className="space-y-2.5">
            <Label htmlFor="imageUrl" className="text-[13px] font-bold text-gray-700 flex items-center space-x-1.5">
              <ImageIcon className="h-4 w-4 text-gray-400" />
              <span>Main Cover Image </span>
            </Label>
            <div className="flex gap-3">
              <Input
                id="imageUrl"
                type="url"
                placeholder="https://images.unsplash.com/photo-..."
                className="flex-1 h-11 text-[14px] bg-emerald-50/30 border-emerald-100 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-600 hover:border-emerald-300 transition-all rounded-xl shadow-sm hover:shadow-md hover:shadow-emerald-900/5"
                {...register("imageUrl")}
              />
              <Button
                type="button"
                onClick={() => handleUploadClick("main")}
                className="h-11 rounded-full px-5 bg-[#a0f212] hover:bg-[#8ad60f] text-black transition-all font-bold text-[13px] flex items-center gap-1.5 shadow-sm border border-[#a0f212]/10"
              >
                <Upload className="h-4 w-4 text-black shrink-0" />
                <span>Upload</span>
              </Button>
            </div>
            {errors.imageUrl && <p className="text-[12px] text-red-500 font-semibold">{errors.imageUrl.message}</p>}
          </div>

          {/* Additional Images */}
          <div className="space-y-4 pt-2">
            <Label className="text-[13px] font-bold text-gray-700 flex items-center space-x-1.5">
              <ImageIcon className="h-4 w-4 text-gray-400" />
              <span>Additional Images (Optional)</span>
            </Label>

            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-3 items-start animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex-1 space-y-1">
                  <div className="flex gap-3">
                    <Input
                      type="url"
                      placeholder="https://images.unsplash.com/photo-..."
                      className="flex-1 h-11 text-[14px] bg-emerald-50/30 border-emerald-100 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-600 hover:border-emerald-300 transition-all rounded-xl shadow-sm hover:shadow-md hover:shadow-emerald-900/5"
                      {...register(`additionalImages.${index}.url` as const)}
                    />
                    <Button
                      type="button"
                      onClick={() => handleUploadClick(index)}
                      className="h-11 rounded-full px-5 bg-[#a0f212] hover:bg-[#8ad60f] text-black transition-all font-bold text-[13px] flex items-center gap-1.5 shadow-sm border border-[#a0f212]/10"
                    >
                      <Upload className="h-4 w-4 text-black shrink-0" />
                      <span>Upload</span>
                    </Button>
                  </div>
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

          {/* YouTube Video URLs */}
          <div className="space-y-4 pt-6 border-t border-gray-100">
            <Label className="text-[13px] font-bold text-gray-700 flex items-center space-x-1.5">
              <Youtube className="h-4 w-4 text-red-500" />
              <span>YouTube Promo Videos (Optional)</span>
            </Label>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="videoUrl1" className="text-[11px] font-semibold text-gray-500">Video 1 URL</Label>
                <Input
                  id="videoUrl1"
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="h-11 text-[14px] bg-emerald-50/30 border-emerald-100 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-600 hover:border-emerald-300 transition-all rounded-xl shadow-sm hover:shadow-md hover:shadow-emerald-900/5"
                  {...register("videoUrl1")}
                />
                {errors.videoUrl1 && <p className="text-[12px] text-red-500 font-semibold">{errors.videoUrl1.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="videoUrl2" className="text-[11px] font-semibold text-gray-500">Video 2 URL</Label>
                <Input
                  id="videoUrl2"
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="h-11 text-[14px] bg-emerald-50/30 border-emerald-100 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-600 hover:border-emerald-300 transition-all rounded-xl shadow-sm hover:shadow-md hover:shadow-emerald-900/5"
                  {...register("videoUrl2")}
                />
                {errors.videoUrl2 && <p className="text-[12px] text-red-500 font-semibold">{errors.videoUrl2.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="videoUrl3" className="text-[11px] font-semibold text-gray-500">Video 3 URL</Label>
                <Input
                  id="videoUrl3"
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="h-11 text-[14px] bg-emerald-50/30 border-emerald-100 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-600 hover:border-emerald-300 transition-all rounded-xl shadow-sm hover:shadow-md hover:shadow-emerald-900/5"
                  {...register("videoUrl3")}
                />
                {errors.videoUrl3 && <p className="text-[12px] text-red-500 font-semibold">{errors.videoUrl3.message}</p>}
              </div>
            </div>
          </div>

          <p className="text-[10px] text-muted-foreground flex items-center space-x-1">
            <Info className="h-3 w-3" />
            <span>Valid image & video URLs are required. Recommended size: 1200×630px.</span>
          </p>
        </CardContent>
      </Card>

      {/* Image Upload Dialog Modal */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="max-w-md w-full p-6 border-none bg-background rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900">Upload Image</DialogTitle>
            <DialogDescription className="text-xs text-gray-500 font-medium mt-1">
              Select or drop an image file here. Videos are not supported.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            {/* Drag & Drop Dropzone */}
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${dragActive
                ? "border-[#a0f212] bg-[#a0f212]/5"
                : "border-gray-200 hover:border-gray-300 bg-gray-50/50 hover:bg-gray-50"
                }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />

              {previewUrl ? (
                <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-sm border border-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              ) : (
                <>
                  <div className="h-10 w-10 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center mb-3">
                    <ImageIcon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-extrabold text-gray-800">
                    Click to choose file, or drag and drop
                  </span>
                  <span className="text-[10px] text-gray-500 font-medium mt-1">
                    Supports PNG, JPG, JPEG, WEBP or AVIF up to 5MB.
                  </span>
                </>
              )}
            </div>

            {/* Error Message */}
            {selectedFile && !selectedFile.type.startsWith("image/") && (
              <p className="text-[12px] text-red-500 font-semibold text-center">
                Please select a valid image file. Videos or other formats are not supported.
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setUploadOpen(false)}
                className="rounded-xl h-11 text-xs font-bold px-4 border-gray-200 text-gray-700 bg-white"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleConfirmUpload}
                disabled={!selectedFile || !selectedFile.type.startsWith("image/")}
                className="rounded-xl h-11 text-xs font-bold px-6 bg-[#0b0c01] text-white hover:bg-black"
              >
                Use Image
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
