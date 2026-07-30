"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm, FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useHostStore } from "@/features/host/store/hostStore";

import { programSchema, ProgramFormValues, CATEGORIES } from "./_components/program-schema";
import BasicInfoSection from "./_components/BasicInfoSection";
import ScheduleSection from "./_components/ScheduleSection";
import PricingSection from "./_components/PricingSection";
import CoverImageSection from "./_components/CoverImageSection";
import InstructorSection from "./_components/InstructorSection";
import VerificationSection from "./_components/VerificationSection";
import PreviewSidebar from "./_components/PreviewSidebar";
import SuccessState from "./_components/SuccessState";

export default function CreateProgramPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get("templateId");
  const { createEvent, isLoading, error, clearError, myEvents, fetchMyEvents } = useHostStore();
  const [submitted, setSubmitted] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("technology");
  const errorRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (error && errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [error]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    reset,
    formState: { errors },
  } = useForm<ProgramFormValues>({
    resolver: zodResolver(programSchema),
    defaultValues: {
      title: "",
      category: "technology",
      mode: "OFFLINE",
      price: 49,
      duration: "3 hours",
      date: new Date().toISOString().split("T")[0],
      endDate: "",
      time: "10:00",
      maxSpots: 15,
      location: "",
      district: "",
      description: "",
      imageUrl: "",
      instructorName: "",
      companyName: "",
      instructorBio: "",
      instructorPhoto: "",
      instagram: "",
      linkedin: "",
      facebook: "",
      verifiedCorrect: false,
      acknowledgedPolicy: false,
    },
  });

  const watchedTitle = watch("title");
  const watchedPrice = watch("price");
  const watchedMaxSpots = watch("maxSpots");
  const watchedDuration = watch("duration");
  const watchedImageUrl = watch("imageUrl");
  const watchedAdditionalImages = watch("additionalImages");

  useEffect(() => {
    if (templateId) {
      if (myEvents.length === 0) {
        fetchMyEvents();
      } else {
        const template = myEvents.find((e: any) => e.id === templateId);
        if (template) {
          const cat = template.category || "technology";
          
          let formattedTime = "10:00";
          if (template.startTime) {
            const dateObj = new Date(template.startTime);
            formattedTime = dateObj.toTimeString().substring(0, 5);
          }
          
          reset({
            title: template.title + " (Copy)",
            category: cat,
            mode: template.mode || "OFFLINE",
            price: template.price || 0,
            duration: template.duration || "",
            date: template.startTime ? template.startTime.split("T")[0] : new Date().toISOString().split("T")[0],
            time: formattedTime,
            maxSpots: template.totalSeats || 15,
            location: template.mode === "ONLINE" ? (template.venue?.meetingLink || "") : (template.venue?.address || ""),
            district: (template.venueDetails as any)?.district || "",
            endDate: (template.venueDetails as any)?.endDate || "",
            description: template.description || "",
            imageUrl: template.posterUrl || "",
            instructorName: template.instructor?.name || "",
            companyName: template.instructor?.companyName || "",
            instructorBio: template.instructor?.bio || "",
            instructorPhoto: template.instructor?.photoUrl || "",
            instagram: template.instructor?.instagram || "",
            linkedin: template.instructor?.linkedin || "",
            facebook: template.instructor?.facebook || "",
            verifiedCorrect: false,
            acknowledgedPolicy: false,
            additionalImages: template.images ? template.images.map((url: string) => ({ url })) : [],
          });
          setSelectedCategory(cat);
        }
      }
    }
  }, [templateId, myEvents, fetchMyEvents, reset]);

  const onSubmit = async (data: ProgramFormValues) => {
    clearError();
    try {
      // Build ISO startTime from YYYY-MM-DD + HH:MM (native time input)
      const startTime = new Date(`${data.date}T${data.time}:00`).toISOString();

      await createEvent({
        title: data.title.trim(),
        posterUrl: data.imageUrl || undefined,
        images: data.additionalImages ? data.additionalImages.map(img => img.url) : [],
        mode: data.mode,          // ← directly from form; user chose ONLINE or OFFLINE
        venue: {
          address: data.mode === "ONLINE" ? "Online" : data.location.trim(),
          meetingLink: data.mode === "ONLINE" ? data.location.trim() : null,
          district: data.mode === "OFFLINE" ? data.district?.trim() : undefined,
          endDate: data.endDate || undefined,
        },
        instructor: {
          name: data.instructorName.trim(),
          companyName: data.companyName.trim(),
          bio: data.instructorBio.trim(),
          photoUrl: data.instructorPhoto.trim(),
          instagram: data.instagram?.trim() || null,
          linkedin: data.linkedin?.trim() || null,
          facebook: data.facebook?.trim() || null,
        },
        startTime,
        totalSeats: Number(data.maxSpots),
        price: Number(data.price),
        duration: data.duration.trim(),
        description: data.description.trim(),
        category: data.category,
        videoUrls: [data.videoUrl1, data.videoUrl2, data.videoUrl3].filter((url): url is string => Boolean(url)),
      });

      setSubmitted(true);
      setTimeout(() => router.push("/host/programs"), 2000);
    } catch {
      // error displayed from store
    }
  };

  const onError = (errors: FieldErrors<ProgramFormValues>) => {
    const firstErrorKey = Object.keys(errors)[0];
    if (firstErrorKey) {
      const element = document.getElementById(firstErrorKey) || document.getElementsByName(firstErrorKey)[0];
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        element.focus();
      }
    }
  };

  const categoryMeta = CATEGORIES.find((c) => c.value === selectedCategory);

  if (submitted) {
    return <SuccessState />;
  }

  return (
    <div className="space-y-10 pb-16 bg-[#fafafa] min-h-screen -mx-8 px-8 pt-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-8 border-b border-gray-200/60">
        <div className="flex items-center space-x-4">
          <Link href="/host/programs">
            <Button variant="outline" size="icon" className="h-10 w-10 rounded-full shrink-0 shadow-sm border-gray-200 hover:bg-white transition-all">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="space-y-1.5">
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
              Create New Workshop
            </h1>
            <p className="text-sm text-gray-500 font-medium">
              Publish a premium training session. Your progress is saved locally.
            </p>
          </div>
        </div>

        {watchedTitle && (
          <div className="animate-in slide-in-from-right-4 duration-500 hidden sm:flex items-center space-x-2.5 bg-white shadow-sm border border-gray-100 text-gray-800 px-5 py-2.5 rounded-full">
            <div className="bg-indigo-50 p-1 rounded-full">
              <Sparkles className="h-4 w-4 text-indigo-500" />
            </div>
            <span className="text-sm font-semibold truncate max-w-[200px]">{watchedTitle}</span>
          </div>
        )}
      </div>

      {/* API error banner */}
      {error && (
        <div ref={errorRef} className="p-4 text-sm font-semibold text-red-600 bg-red-50 rounded-xl border border-red-200 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
          {error}
        </div>
      )}

      <form id="create-program-form" onSubmit={handleSubmit(onSubmit, onError)} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left: Form Sections */}
          <div className="lg:col-span-8 space-y-8">
            <BasicInfoSection
              register={register}
              errors={errors}
              setValue={setValue}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              categoryMeta={categoryMeta}
            />
            {/* Pass setValue + watch so ScheduleSection can control the mode field */}
            <ScheduleSection
              register={register}
              errors={errors}
              setValue={setValue}
              watch={watch}
            />
            <PricingSection register={register} errors={errors} />
            <CoverImageSection register={register} errors={errors} control={control} />
            <InstructorSection register={register} errors={errors} />
            <VerificationSection register={register} errors={errors} />
          </div>

          {/* Right: Sidebar */}
          <PreviewSidebar
            watchedTitle={watchedTitle}
            watchedPrice={watchedPrice}
            watchedMaxSpots={watchedMaxSpots}
            watchedDuration={watchedDuration}
            watchedImageUrl={watchedImageUrl}
            watchedAdditionalImages={watchedAdditionalImages}
            selectedCategory={selectedCategory}
            categoryMeta={categoryMeta}
            isSubmitting={isLoading}
            watch={watch}
          />

        </div>
      </form>
    </div>
  );
}
