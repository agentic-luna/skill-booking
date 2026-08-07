"use client";

import React from "react";
import Link from "next/link";
import { UseFormWatch } from "react-hook-form";
import {
  Sparkles, Clock, Ticket, Image as ImageIcon,
  Loader2, Info, Eye
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CategoryMeta, ProgramFormValues } from "./program-schema";
import { Program } from "@/constants/mockData";
import ProgramDetailsContent from "../../../../../(client)/programs/[id]/ProgramDetailsContent";

interface PreviewSidebarProps {
  watchedTitle: string;
  watchedPrice?: number;
  watchedMaxSpots?: number;
  watchedTicketTypes?: { price: number; totalSeats: number }[];
  watchedDuration: string;
  watchedImageUrl?: string;
  watchedAdditionalImages?: { url: string }[];
  watchedVideoUrls?: string[];
  selectedCategory: string;
  categoryMeta: CategoryMeta | undefined;
  isSubmitting: boolean;
  watch?: UseFormWatch<ProgramFormValues>;
}

export default function PreviewSidebar({
  watchedTitle,
  watchedPrice,
  watchedMaxSpots,
  watchedTicketTypes,
  watchedDuration,
  watchedImageUrl,
  watchedAdditionalImages,
  watchedVideoUrls,
  selectedCategory,
  categoryMeta,
  isSubmitting,
  watch,
}: PreviewSidebarProps) {
  const [imageError, setImageError] = React.useState(false);
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [activeImageIndex, setActiveImageIndex] = React.useState(0);

  const validAdditionalImages = watchedAdditionalImages?.filter(img => img.url.trim() !== "") || [];
  const allImages = watchedImageUrl ? [watchedImageUrl, ...validAdditionalImages.map(i => i.url)] : validAdditionalImages.map(i => i.url);
  const totalImages = allImages.length;

  const totalSpots = watchedTicketTypes && watchedTicketTypes.length > 0
    ? watchedTicketTypes.reduce((acc, tt) => acc + (Number(tt.totalSeats) || 0), 0)
    : (watchedMaxSpots || 0);

  const lowestPrice = watchedTicketTypes && watchedTicketTypes.length > 0
    ? Math.min(...watchedTicketTypes.map(tt => Number(tt.price) || 0))
    : (watchedPrice || 0);

  React.useEffect(() => {
    setImageError(false);
  }, [allImages[activeImageIndex]]);
  
  // Reset active image if the selected index is out of bounds due to removals
  React.useEffect(() => {
    if (activeImageIndex >= totalImages && totalImages > 0) {
      setActiveImageIndex(totalImages - 1);
    } else if (totalImages === 0) {
      setActiveImageIndex(0);
    }
  }, [totalImages, activeImageIndex]);

  return (
    <div className="lg:col-span-4 space-y-6">
      {/* Sticky wrapper */}
      <div className="lg:sticky lg:top-24 space-y-6">

        {/* Live Preview Card */}
        <Card className="rounded-[32px] border-[6px] border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.06)] bg-white/40 backdrop-blur-3xl overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-white/50 to-purple-50/50 -z-10" />
          <CardHeader className="bg-transparent border-b border-gray-200/40 pb-5 pt-6 px-7">
            <CardTitle className="text-[16px] font-extrabold flex items-center space-x-2.5 text-gray-900">
              <span>Live Preview</span>
            </CardTitle>
            <CardDescription className="text-[13px] font-medium text-gray-500">How your program card will appear.</CardDescription>
          </CardHeader>
          <CardContent className="p-7">
            <div className="rounded-[20px] border border-gray-200/60 overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow duration-500">
              {/* Image placeholder */}
              <div className="aspect-video bg-gradient-to-br from-primary/10 via-muted to-violet-500/10 flex items-center justify-center relative overflow-hidden">
                {allImages.length > 0 && !imageError ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={allImages[activeImageIndex]}
                    alt={watchedTitle || "Program cover"}
                    className="w-full h-full object-cover transition-all duration-500"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <ImageIcon className="h-8 w-8 text-muted-foreground/30" />
                )}
                {categoryMeta && (
                  <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[9px] px-2 py-0.5 rounded-md font-semibold capitalize">
                    {selectedCategory}
                  </div>
                )}
                {totalImages > 1 && (
                  <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded-lg font-bold flex items-center space-x-1">
                    <ImageIcon className="h-3 w-3" />
                    <span>{activeImageIndex + 1}/{totalImages}</span>
                  </div>
                )}
                <div className="absolute top-2 right-2 bg-amber-500/80 backdrop-blur-sm text-white text-[9px] px-2 py-0.5 rounded-md font-bold uppercase">
                  Pending
                </div>
              </div>

              {/* Thumbnails */}
              {totalImages > 1 && (
                <div className="flex gap-2 p-3 pb-0 overflow-x-auto scrollbar-hide">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setActiveImageIndex(idx);
                        setImageError(false);
                      }}
                      className={`relative w-12 h-8 rounded-md overflow-hidden shrink-0 border-2 transition-all ${
                        activeImageIndex === idx ? 'border-indigo-500 opacity-100 shadow-sm' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              <div className="p-4 space-y-2.5">
                <h4 className="font-bold text-xs text-foreground line-clamp-2 leading-tight min-h-[2rem]">
                  {watchedTitle || "Workshop Title Preview"}
                </h4>
                <div className="grid grid-cols-2 gap-1.5 text-[9px] text-muted-foreground">
                  <span className="flex items-center"><Clock className="h-2.5 w-2.5 mr-1" /> {watchedDuration || "—"}</span>
                  <span className="flex items-center"><Ticket className="h-2.5 w-2.5 mr-1" /> {totalSpots} spots</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border/30">
                  <span className="text-sm font-extrabold text-foreground">
                    {watchedTicketTypes && watchedTicketTypes.length > 1 ? "From " : ""}₹{lowestPrice}
                  </span>
                  <span className="text-[9px] text-muted-foreground">Live Preview</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info callout */}
        <div className="flex items-start space-x-3 text-[13px] bg-white p-5 rounded-[20px] border border-gray-100 shadow-sm text-gray-600">
          <Info className="h-5 w-5 mt-0.5 shrink-0 text-indigo-400" />
          <div>
            <div className="font-extrabold text-gray-900">Approval Required</div>
            <p className="text-[12px] text-gray-500 mt-1 leading-relaxed">
              All newly created workshops require Super Admin validation before they are visible on the explore listings.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4 pt-2">
          <Button
            type="submit"
            form="create-program-form"
            className="w-full h-14 rounded-2xl text-[15px] font-extrabold bg-gradient-to-r from-gray-900 to-black hover:from-black hover:to-gray-900 text-white shadow-xl shadow-gray-900/20 hover:scale-[1.02] transition-all duration-300"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Publishing…
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5 text-indigo-300" />
                Publish Workshop
              </>
            )}
          </Button>

          {watch && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setPreviewOpen(true)}
              className="w-full h-12 rounded-[16px] text-[14px] font-bold border-gray-200 text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 shadow-sm transition-all duration-200"
            >
              <Eye className="mr-2 h-4 w-4 text-gray-400" />
              Preview Client View
            </Button>
          )}

          <Link href="/host/programs" className="block pt-1">
            <Button variant="ghost" type="button" className="w-full h-11 rounded-[16px] text-[13px] font-bold text-gray-500 hover:text-gray-900 hover:bg-gray-100">
              Cancel
            </Button>
          </Link>
        </div>

        {/* Dialog for Client View Live Preview */}
        {watch && (
          <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
            <DialogContent className="max-w-5xl w-full h-[90vh] overflow-y-auto p-0 border-none bg-background rounded-2xl">
              <DialogHeader className="sr-only">
                <DialogTitle>Client View Live Preview</DialogTitle>
              </DialogHeader>
              <div className="relative">
                {(() => {
                  const values = watch();
                  const dateStr = values.date || new Date().toISOString().split("T")[0];
                  const locationStr = values.mode === "ONLINE"
                    ? "Online"
                    : values.location || "In Person";

                  const previewProgram: Program = {
                    id: "preview",
                    title: values.title || "Workshop Title Preview",
                    description: values.description || "Course description text goes here...",
                    instructorName: values.instructorName || "Instructor Name",
                    instructorAvatar: values.instructorPhoto || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
                    instructorBio: values.instructorBio || "Bio of the instructor...",
                    instagram: values.instagram || "",
                    linkedin: values.linkedin || "",
                    facebook: values.facebook || "",
                    companyName: values.companyName || "Training Masterclass Ltd.",
                    category: (values.category as any) || "technology",
                    rating: 4.8,
                    reviewsCount: 12,
                    price: lowestPrice,
                    duration: values.duration || "2 hours",
                    date: dateStr,
                    time: values.time ? `${values.time} IST` : "10:00 AM IST",
                    spotsLeft: totalSpots,
                    maxSpots: totalSpots,
                    location: locationStr,
                    imageUrl: values.imageUrl || "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=600",
                    images: watchedAdditionalImages ? watchedAdditionalImages.map((img: { url: string }) => img.url).filter(Boolean) : [],
                    videoUrls: watchedVideoUrls || [],
                    status: "approved",
                    featured: true,
                    mode: values.mode || "OFFLINE",
                  };

                  return <ProgramDetailsContent programId="preview" initialProgram={previewProgram} />;
                })()}
              </div>
            </DialogContent>
          </Dialog>
        )}

      </div>
    </div>
  );
}
