"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useForm, FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Save, Loader2, Trash2, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useHostStore } from "@/features/host/store/hostStore";
import { getEventDetails } from "@/features/client/api/client.api";
import { useAlertStore } from "@/features/alerts/store/alertStore";

import { programSchema, ProgramFormValues, CATEGORIES } from "../../create/_components/program-schema";
import BasicInfoSection from "../../create/_components/BasicInfoSection";
import ScheduleSection from "../../create/_components/ScheduleSection";
import PricingSection from "../../create/_components/PricingSection";
import CoverImageSection from "../../create/_components/CoverImageSection";
import InstructorSection from "../../create/_components/InstructorSection";
import VerificationSection from "../../create/_components/VerificationSection";

export default function EditProgramPage() {
  const router = useRouter();
  const params = useParams();
  const programId = params.id as string;
  const showAlert = useAlertStore((s) => s.showAlert);

  const { updateEvent, deleteEvent, requestEditAccess } = useHostStore();

  const [program, setProgram] = useState<any>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isApprovedLocked, setIsApprovedLocked] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("technology");
  const [editReason, setEditReason] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    control,
    formState: { errors },
  } = useForm<ProgramFormValues>({
    resolver: zodResolver(programSchema),
  });

  useEffect(() => {
    async function loadProgram() {
      try {
        const details = await getEventDetails(programId);
        if (details.status.toLowerCase() === "approved") {
          setProgram(details);
          setIsApprovedLocked(true);
          setPageLoading(false);
          return;
        }
        setProgram(details);
        setSelectedCategory(details.category || "technology");

        const start = details.startTime ? new Date(details.startTime) : new Date();
        const dateStr = start.toISOString().split("T")[0];

        // Format as HH:MM for the native time input
        const hh = String(start.getUTCHours()).padStart(2, "0");
        const mm = String(start.getUTCMinutes()).padStart(2, "0");
        const timeStr = `${hh}:${mm}`;

        // Normalise mode: strip any HYBRID values the DB might have stored
        const rawMode = (details.mode || "OFFLINE").toUpperCase();
        const safeMode: "ONLINE" | "OFFLINE" = rawMode === "OFFLINE" ? "OFFLINE" : "ONLINE";

        reset({
          title: details.title || "",
          category: (details.category as any) || "technology",
          mode: safeMode,
          price: details.price ?? 0,
          duration: details.duration || "2 hours",
          date: dateStr,
          endDate: details.venueDetails?.endDate || "",
          time: timeStr,
          maxSpots: details.totalSeats || 10,
          location:
            typeof details.venueDetails === "string"
              ? details.venueDetails
              : details.venueDetails?.address || "",
          district: details.venueDetails?.district || "",
          description: details.description || "",
          videoUrl1: details.videoUrls && details.videoUrls[0] ? details.videoUrls[0] : "",
          videoUrl2: details.videoUrls && details.videoUrls[1] ? details.videoUrls[1] : "",
          videoUrl3: details.videoUrls && details.videoUrls[2] ? details.videoUrls[2] : "",
          imageUrl: details.posterUrl || "",
          additionalImages: details.images && details.images.length > 0 
            ? details.images.map((url: string) => ({ url })) 
            : [],
          instructorName: details.venueDetails?.instructorName || "",
          companyName: details.venueDetails?.companyName || "",
          instructorBio: details.venueDetails?.instructorBio || "",
          instructorPhoto: details.venueDetails?.instructorPhoto || "",
          instagram: details.venueDetails?.instagram || "",
          linkedin: details.venueDetails?.linkedin || "",
          facebook: details.venueDetails?.facebook || "",
          verifiedCorrect: false,
          acknowledgedPolicy: false,
        });
      } catch (err: any) {
        showAlert("Error", err.message || "Failed to load program details.", "destructive");
      } finally {
        setPageLoading(false);
      }
    }
    loadProgram();
  }, [programId, reset, showAlert]);

  const categoryMeta = CATEGORIES.find((c) => c.value === selectedCategory);

  const onSubmit = async (data: ProgramFormValues) => {
    setIsSubmitting(true);
    try {
      // Build ISO startTime from YYYY-MM-DD + HH:MM (native time input — no AM/PM parsing needed)
      const startTime = new Date(`${data.date}T${data.time}:00`).toISOString();

      await updateEvent(programId, {
        title: data.title.trim(),
        posterUrl: data.imageUrl || undefined,
        images: data.additionalImages ? data.additionalImages.map(img => img.url) : [],
        mode: data.mode,          // ← directly from form
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

      showAlert("Program Updated", "Your changes have been saved successfully.", "success");
      router.push("/host/programs");
    } catch (err: any) {
      showAlert("Error", err.message || "Failed to save changes.", "destructive");
    } finally {
      setIsSubmitting(false);
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

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this program? This action cannot be undone.")) return;
    setIsDeleting(true);
    try {
      await deleteEvent(programId);
      showAlert("Program Deleted", "The workshop has been removed.", "success");
      router.push("/host/programs");
    } catch (err: any) {
      showAlert("Error", err.message || "Failed to delete program.", "destructive");
    } finally {
      setIsDeleting(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-xs text-muted-foreground">Loading workshop details...</p>
      </div>
    );
  }

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

  if (isApprovedLocked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4 bg-gray-50 border border-black/5 rounded-[40px] p-8">
        <div className="w-16 h-16 bg-white shadow-sm border border-black/5 rounded-full flex items-center justify-center mb-2">
          <Lock className="h-8 w-8 text-amber-500" />
        </div>
        <h2 className="text-2xl font-extrabold text-[#0b0c01]">Program Locked</h2>
        <p className="text-sm text-muted-foreground max-w-md font-medium">
          This workshop is currently live and approved. To protect attendees who may have already booked tickets, core details cannot be directly edited.
        </p>

        <div className="w-full max-w-md mt-4 space-y-2 text-left">
          <label className="text-sm font-bold text-foreground">Reason for Edit (Optional)</label>
          <textarea 
            className="w-full rounded-xl border border-black/10 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[80px]"
            placeholder="E.g., Need to update physical venue location..."
            value={editReason}
            onChange={(e) => setEditReason(e.target.value)}
          />
        </div>

        <div className="flex gap-4 mt-8 pt-4">
          <Link href="/host/programs">
            <Button variant="outline" className="rounded-xl text-sm font-bold h-11 px-6">
              Back to Programs
            </Button>
          </Link>
          <Button 
            disabled={isSubmitting}
            onClick={async () => {
              setIsSubmitting(true);
              try {
                await requestEditAccess(programId, editReason);
                showAlert("Request Sent", "Admin has been notified of your request to edit this live program.", "success");
                router.push("/host/programs");
              } catch (err: any) {
                showAlert("Request Failed", err.message || "Failed to submit request.", "destructive");
              } finally {
                setIsSubmitting(false);
              }
            }} 
            className="rounded-xl text-sm font-bold h-11 px-6 bg-[#0b0c01] text-white hover:bg-black/80 shadow-xl"
          >
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Request Edit Access
          </Button>
        </div>
      </div>
    );
  }

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

        {/* Current status badge */}
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-muted-foreground font-medium">Status:</span>
          <span
            className={`px-2.5 py-1 rounded-md font-bold uppercase text-[10px] text-white ${
              program.status.toLowerCase() === "approved"
                ? "bg-emerald-500"
                : program.status.toLowerCase() === "pending"
                ? "bg-amber-500"
                : "bg-destructive"
            }`}
          >
            {program.status}
          </span>
        </div>
      </div>

      <form id="edit-program-form" onSubmit={handleSubmit(onSubmit, onError)} className="space-y-8">
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
            {/* Pass setValue + watch so ScheduleSection can control the mode toggle */}
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

          {/* ── Right Column: Actions ──────────────────────────────── */}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-24 space-y-4">

              {/* Submit */}
              <Button
                type="submit"
                form="edit-program-form"
                className="w-full h-11 rounded-xl text-sm font-bold shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all duration-300"
                disabled={isSubmitting || isDeleting}
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

              {/* Delete button (only if status is PENDING) */}
              {program.status.toLowerCase() === "pending" && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  className="w-full h-10 rounded-xl text-xs font-bold"
                  disabled={isDeleting || isSubmitting}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting…
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Workshop
                    </>
                  )}
                </Button>
              )}

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
