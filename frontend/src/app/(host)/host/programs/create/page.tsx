"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
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
  const { createEvent, isLoading, error, clearError } = useHostStore();
  const [submitted, setSubmitted] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("technology");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
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
      time: "10:00",
      maxSpots: 15,
      location: "",
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
      });

      setSubmitted(true);
      setTimeout(() => router.push("/host/programs"), 2000);
    } catch {
      // error displayed from store
    }
  };

  const categoryMeta = CATEGORIES.find((c) => c.value === selectedCategory);

  if (submitted) {
    return <SuccessState />;
  }

  return (
    <div className="space-y-8 pb-12">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-border/40">
        <div className="flex items-center space-x-4">
          <Link href="/host/programs">
            <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl shrink-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
              Create New Program
            </h1>
            <p className="text-sm text-muted-foreground">
              Fill in the details below to publish a new skill workshop.
            </p>
          </div>
        </div>

        {watchedTitle && (
          <div className="animate-in slide-in-from-right-4 duration-300 hidden sm:flex items-center space-x-2 bg-primary/5 border border-primary/15 text-primary px-4 py-2 rounded-xl">
            <Sparkles className="h-3.5 w-3.5" />
            <span className="text-xs font-semibold truncate max-w-[200px]">{watchedTitle}</span>
          </div>
        )}
      </div>

      {/* API error banner */}
      {error && (
        <div className="p-3 text-xs font-medium text-destructive bg-destructive/10 rounded-lg border border-destructive/20">
          {error}
        </div>
      )}

      <form id="create-program-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left: Form Sections */}
          <div className="lg:col-span-8 space-y-6">
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
