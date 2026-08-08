"use client";

import React from "react";
import { UseFormRegister, FieldErrors, UseFormSetValue } from "react-hook-form";
import { User, FileText, Image as ImageIcon, Instagram, Linkedin, Facebook, Upload } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ProgramFormValues } from "./program-schema";

interface InstructorSectionProps {
  register: UseFormRegister<ProgramFormValues>;
  errors: FieldErrors<ProgramFormValues>;
  setValue: UseFormSetValue<ProgramFormValues>;
}

export default function InstructorSection({ register, errors, setValue }: InstructorSectionProps) {
  const [uploadOpen, setUploadOpen] = React.useState(false);
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
          setValue("instructorPhoto", compressedBase64, { shouldValidate: true });
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
              <CardTitle className="text-[17px] font-extrabold text-gray-900">Instructor Details</CardTitle>
              <CardDescription className="text-[13px] text-gray-500 font-medium">Provide the profile details and social links of the class instructor.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-7 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
          </div>

          {/* Instructor Photo */}
          <div className="space-y-2.5">
            <Label htmlFor="instructorPhoto" className="text-[13px] font-bold text-gray-700 flex items-center space-x-1.5">
              <ImageIcon className="h-4 w-4 text-gray-400" />
              <span>Profile Photo</span>
            </Label>
            <div className="flex gap-3">
              <Input
                id="instructorPhoto"
                type="url"
                placeholder="https://images.unsplash.com/photo-..."
                className="flex-1 h-11 text-[14px] bg-emerald-50/30 border-emerald-100 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-600 hover:border-emerald-300 transition-all rounded-xl shadow-sm hover:shadow-md hover:shadow-emerald-900/5"
                {...register("instructorPhoto")}
              />
              <Button
                type="button"
                onClick={() => setUploadOpen(true)}
                className="h-11 rounded-full px-5 bg-[#a0f212] hover:bg-[#8ad60f] text-black transition-all font-bold text-[13px] flex items-center gap-1.5 shadow-sm border border-[#a0f212]/10"
              >
                <Upload className="h-4 w-4 text-black shrink-0" />
                <span>Upload</span>
              </Button>
            </div>
            {errors.instructorPhoto && <p className="text-[12px] text-red-500 font-semibold">{errors.instructorPhoto.message}</p>}
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

      {/* Image Upload Dialog Modal */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="max-w-md w-full p-6 border-none bg-background rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900">Upload Instructor Image</DialogTitle>
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
              className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${
                dragActive
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
