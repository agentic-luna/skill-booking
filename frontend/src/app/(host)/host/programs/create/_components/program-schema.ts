import * as z from "zod";

// ── Zod Validation Schema ──────────────────────────────────────────────
export const programSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  category: z.enum(["technology", "design", "fitness", "culinary", "business", "photography"]),
  mode: z.enum(["ONLINE", "OFFLINE"]),
  price: z.preprocess((val) => Number(val), z.number().min(0, "Price must be non-negative")),
  duration: z.string().min(2, "Duration is required (e.g. 4 hours)"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date format must be YYYY-MM-DD"),
  time: z.string().regex(/^([01]?\d|2[0-3]):[0-5]\d$/, "Select a valid start time (HH:MM)"),
  maxSpots: z.preprocess((val) => Number(val), z.number().min(1, "Must allow at least 1 spot")),
  location: z.string().min(3, "Location or online webinar links are required"),
  description: z.string().min(20, "Provide a description of at least 20 characters"),
  imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

export type ProgramFormValues = z.infer<typeof programSchema>;

// ── Category metadata ──────────────────────────────────────────────────
export const CATEGORIES = [
  { value: "technology", label: "Technology & Code", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20" },
  { value: "design", label: "UI/UX & Design", color: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20" },
  { value: "fitness", label: "Fitness & Health", color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" },
  { value: "culinary", label: "Culinary Arts", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" },
  { value: "business", label: "Business Skills", color: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20" },
  { value: "photography", label: "Photography", color: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20" },
] as const;

export type CategoryMeta = (typeof CATEGORIES)[number];
