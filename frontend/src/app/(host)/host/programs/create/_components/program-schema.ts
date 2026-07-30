import * as z from "zod";

// ── Zod Validation Schema ──────────────────────────────────────────────
export const programSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  category: z.enum(["technology", "design", "fitness", "culinary", "business", "photography"]),
  mode: z.enum(["ONLINE", "OFFLINE"]),
  price: z.preprocess((val) => Number(val), z.number().min(0, "Price must be non-negative")),
  duration: z.string().min(2, "Duration is required (e.g. 4 hours)"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date format must be YYYY-MM-DD"),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date format must be YYYY-MM-DD").optional().or(z.literal("")),
  time: z.string().regex(/^([01]?\d|2[0-3]):[0-5]\d$/, "Select a valid start time (HH:MM)"),
  maxSpots: z.preprocess((val) => Number(val), z.number().min(1, "Must allow at least 1 spot")),
  location: z.string().min(3, "Location or online webinar links are required"),
  district: z.string().optional(),
  description: z.string().min(20, "Provide a description of at least 20 characters"),
  videoUrl1: z.string().url("Must be a valid YouTube URL").optional().or(z.literal("")),
  videoUrl2: z.string().url("Must be a valid YouTube URL").optional().or(z.literal("")),
  videoUrl3: z.string().url("Must be a valid YouTube URL").optional().or(z.literal("")),
  imageUrl: z.string().min(1, "Cover image URL is required").url("Must be a valid URL"),
  instructorName: z.string().min(2, "Instructor name must be at least 2 characters"),
  companyName: z.string().min(1, "Company/Organization name is required"),
  instructorBio: z.string().min(10, "Instructor biography must be at least 10 characters"),
  instructorPhoto: z.string().min(1, "Instructor photo URL is required").url("Must be a valid URL"),
  instagram: z.string().url("Must be a valid Instagram URL").optional().or(z.literal("")),
  linkedin: z.string().url("Must be a valid LinkedIn URL").optional().or(z.literal("")),
  facebook: z.string().url("Must be a valid Facebook URL").optional().or(z.literal("")),
  additionalImages: z.array(z.object({ url: z.string().url("Must be a valid URL") })).optional(),
  verifiedCorrect: z.boolean().refine(val => val === true, {
    message: "You must confirm that all details are accurate"
  }),
  acknowledgedPolicy: z.boolean().refine(val => val === true, {
    message: "You must acknowledge the admin review policy"
  }),
}).superRefine((data, ctx) => {
  // Validate that the event start date/time is in the future
  const now = new Date();
  const eventDateTime = new Date(`${data.date}T${data.time}:00`);
  if (isNaN(eventDateTime.getTime()) || eventDateTime < now) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Event date and time must be in the future",
      path: ["date"],
    });
  }

  if (data.mode === "OFFLINE" && (!data.district || !data.district.trim())) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Please select a Kerala district for offline events",
      path: ["district"],
    });
  }
});

export type ProgramFormValues = z.infer<typeof programSchema>;

// ── Category metadata ──────────────────────────────────────────────────
export const CATEGORIES = [
  { value: "technology", label: "Technology & Code", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20" },
  { value: "design", label: "UI/UX & Design", color: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20" },
  { value: "fitness", label: "Fitness & Health", color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" },
  { value: "culinary", label: "Culinary Arts", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" },
  { value: "business", label: "Business Training", color: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20" },
  { value: "photography", label: "Photography", color: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20" },
] as const;

export type CategoryMeta = (typeof CATEGORIES)[number];
