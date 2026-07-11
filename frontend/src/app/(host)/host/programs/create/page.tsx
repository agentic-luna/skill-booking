"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { MOCK_PROGRAMS, Program } from "@/constants/mockData";

import { programSchema, ProgramFormValues, CATEGORIES } from "./_components/program-schema";
import BasicInfoSection from "./_components/BasicInfoSection";
import ScheduleSection from "./_components/ScheduleSection";
import PricingSection from "./_components/PricingSection";
import CoverImageSection from "./_components/CoverImageSection";
import PreviewSidebar from "./_components/PreviewSidebar";
import SuccessState from "./_components/SuccessState";

export default function CreateProgramPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("technology");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProgramFormValues>({
    resolver: zodResolver(programSchema),
    defaultValues: {
      title: "",
      category: "technology",
      price: 49,
      duration: "3 hours",
      date: new Date().toISOString().split("T")[0],
      time: "10:00 AM - 1:00 PM EST",
      maxSpots: 15,
      location: "Online Zoom link",
      description: "",
      imageUrl: "",
    },
  });

  const watchedTitle = watch("title");
  const watchedPrice = watch("price");
  const watchedMaxSpots = watch("maxSpots");
  const watchedDuration = watch("duration");

  const onSubmit = async (data: ProgramFormValues) => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const newProg : Program = {
      id: `prog_${Math.random().toString(36).substr(2, 9)}`,
      title: data.title,
      category: data.category,
      price: data.price,
      duration: data.duration,
      rating:2,
      reviewsCount:2,
      date: data.date,
      time: data.time,
      maxSpots: data.maxSpots,
      spotsLeft: data.maxSpots,
      location: data.location,
      description: data.description,
      instructorName: "Sarah Jenkins",
      instructorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100",
      imageUrl: data.imageUrl || "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=600",
      status: "pending",
      featured: false,
    };

    MOCK_PROGRAMS.unshift(newProg);
    setIsSubmitting(false);
    setSubmitted(true);

    // Redirect to programs list after brief success animation
    setTimeout(() => {
      router.push("/host/programs");
    }, 2000);
  };

  const categoryMeta = CATEGORIES.find((c) => c.value === selectedCategory);

  // ── Success State ────────────────────────────────────────────────────
  if (submitted) {
    return <SuccessState />;
  }

  // ── Form Page ────────────────────────────────────────────────────────
  return (
    <div className="space-y-8 pb-12">

      {/* ── Page Header ──────────────────────────────────────────────── */}
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

        {/* Live preview pill */}
        {watchedTitle && (
          <div className="animate-in slide-in-from-right-4 duration-300 hidden sm:flex items-center space-x-2 bg-primary/5 border border-primary/15 text-primary px-4 py-2 rounded-xl">
            <Sparkles className="h-3.5 w-3.5" />
            <span className="text-xs font-semibold truncate max-w-[200px]">{watchedTitle}</span>
          </div>
        )}
      </div>

      <form id="create-program-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* ── Left Column: Form Sections ─────────────────────────── */}
          <div className="lg:col-span-8 space-y-6">
            <BasicInfoSection
              register={register}
              errors={errors}
              setValue={setValue}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              categoryMeta={categoryMeta}
            />
            <ScheduleSection register={register} errors={errors} />
            <PricingSection register={register} errors={errors} />
            <CoverImageSection register={register} errors={errors} />
          </div>

          {/* ── Right Column: Sidebar ──────────────────────────────── */}
          <PreviewSidebar
            watchedTitle={watchedTitle}
            watchedPrice={watchedPrice}
            watchedMaxSpots={watchedMaxSpots}
            watchedDuration={watchedDuration}
            selectedCategory={selectedCategory}
            categoryMeta={categoryMeta}
            isSubmitting={isSubmitting}
          />

        </div>
      </form>
    </div>
  );
}
