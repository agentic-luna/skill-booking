import * as z from "zod";
import { CATEGORIES as SHARED_CATEGORIES } from "@/constants/categories";

// ── Zod Validation Schema ──────────────────────────────────────────────
export const programSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  category: z.enum(["life-coaching", "relationship", "business", "trauma-healing"]),
  keywords: z.array(z.string()).optional(),
  mode: z.enum(["ONLINE", "OFFLINE"]),
  price: z.preprocess((val) => Number(val), z.number().min(0, "Price must be non-negative")).optional(),
  maxSpots: z.preprocess((val) => Number(val), z.number().min(1, "Must allow at least 1 spot")).optional(),
  ticketTypes: z.array(z.object({
    name: z.string().min(1, "Ticket name is required"),
    price: z.preprocess((val) => Number(val), z.number().min(0, "Price must be non-negative")),
    totalSeats: z.preprocess((val) => Number(val), z.number().min(1, "Must allow at least 1 spot"))
  })).min(1, "At least one ticket type is required"),
  duration: z.string().min(2, "Duration is required (e.g. 4 hours)"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date format must be YYYY-MM-DD"),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date format must be YYYY-MM-DD").optional().or(z.literal("")),
  time: z.string().regex(/^([01]?\d|2[0-3]):[0-5]\d$/, "Select a valid start time (HH:MM)"),
  location: z.string().min(3, "Location or online webinar links are required"),
  district: z.string().optional(),
  description: z.string().min(20, "Provide a description of at least 20 characters"),
  whatIsThisProgram: z.string().min(1, "Answer to 'What Is This Program?' is required"),
  whoIsThisFor: z.string().min(1, "Answer to 'Who Is This Training/Course For?' is required"),
  whatWillYouLearn: z.string().min(1, "Answer to 'What Will You Learn?' is required"),
  topicsCovered: z.string().min(1, "Answer to 'What topics we will be teaching?' is required"),
  mediumOfLanguage: z.string().min(1, "Medium of Language is required"),
  prerequisites: z.string().optional(),
  takeaways: z.string().optional(),
  toolsGiven: z.string().optional(),
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
export const CATEGORIES = SHARED_CATEGORIES;
export type CategoryMeta = (typeof SHARED_CATEGORIES)[number];
