"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Save, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { MOCK_PROGRAMS, Program } from "@/constants/mockData";

import { programSchema, ProgramFormValues, CATEGORIES } from "../../create/_components/program-schema";
import BasicInfoSection from "../../create/_components/BasicInfoSection";
import ScheduleSection from "../../create/_components/ScheduleSection";
import PricingSection from "../../create/_components/PricingSection";
import CoverImageSection from "../../create/_components/CoverImageSection";

export default function EditProgramPage() {
  const router = useRouter();
  const params = useParams();
  const programId = params.id as string;

  const program = MOCK_PROGRAMS.find((p) => p.id === programId);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>(program?.category || "technology");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProgramFormValues>({
    resolver: zodResolver(programSchema),
    defaultValues: {
      title: program?.title || "",
      category: program?.category || "technology",
      price: program?.price || 49,
      duration: program?.duration || "3 hours",
      date: program?.date || new Date().toISOString().split("T")[0],
      time: program?.time || "10:00 AM - 1:00 PM EST",
      maxSpots: program?.maxSpots || 15,
      location: program?.location || "",
      description: program?.description || "",
      imageUrl: program?.imageUrl || "",
    },
  });

  const categoryMeta = CATEGORIES.find((c) => c.value === selectedCategory);

  // ── 404 ──────────────────────────────────────────────────────────────
  if (!program) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
        <h2 className="text-xl font-extrabold text-foreground">Program Not Found</h2>
        <p className="text-sm text-muted-foreground">The workshop you&apos;re trying to edit doesn&apos;t exist.</p>
        <Link href="/host/programs">
          <Button variant="outline" className="rounded-xl text-xs">
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back to Programs
          </Button>
        </Link>
      </div>
    );
  }

  const onSubmit = async (data: ProgramFormValues) => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));

    // Update in mock array
    const idx = MOCK_PROGRAMS.findIndex((p) => p.id === programId);
    if (idx !== -1) {
      MOCK_PROGRAMS[idx] = {
        ...MOCK_PROGRAMS[idx],
        ...data,
        spotsLeft: Math.min(data.maxSpots, MOCK_PROGRAMS[idx].spotsLeft + (data.maxSpots - MOCK_PROGRAMS[idx].maxSpots)),
      };
    }

    setIsSubmitting(false);
    router.push("/host/programs");
  };

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
              Edit Program
            </h1>
            <p className="text-sm text-muted-foreground">
              Update the details of <span className="font-semibold text-foreground">{program.title}</span>
            </p>
          </div>
        </div>
      </div>

      <form id="edit-program-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8">
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

          {/* ── Right Column: Actions ──────────────────────────────── */}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-24 space-y-4">

              {/* Current status badge */}
              <div className="flex items-center space-x-2 text-xs">
                <span className="text-muted-foreground font-medium">Current status:</span>
                <span
                  className={`px-2.5 py-1 rounded-md font-bold uppercase text-[10px] text-white ${
                    program.status === "approved"
                      ? "bg-emerald-500"
                      : program.status === "pending"
                      ? "bg-amber-500"
                      : "bg-destructive"
                  }`}
                >
                  {program.status}
                </span>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                form="edit-program-form"
                className="w-full h-11 rounded-xl text-sm font-bold shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all duration-300"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>

              <Link href="/host/programs" className="block">
                <Button variant="outline" type="button" className="w-full h-10 rounded-xl text-xs font-semibold">
                  Cancel
                </Button>
              </Link>
            </div>
          </div>

        </div>
      </form>
    </div>
  );
}
