import { z } from "zod";

export const primaryParticipantSchema = z.object({
  fullName: z.string().trim().min(2, "Full name must be at least 2 characters"),
  email: z.string().trim().email("Please enter a valid email address"),
  mobile: z.string().trim().min(7, "Mobile number must be at least 7 digits"),
  dob: z.string().min(1, "Date of birth is required"),
  gender: z.string().min(1, "Please select a gender"),
  city: z.string().trim().min(2, "City is required"),
  state: z.string().min(1, "Please select a state"),
  country: z.string().optional(),
});

export const additionalParticipantSchema = z.object({
  fullName: z.string().trim().min(2, "Full name must be at least 2 characters"),
  email: z.string().trim().email("Please enter a valid email address"),
  mobile: z.string().trim().min(7, "Mobile number must be at least 7 digits"),
  gender: z.string().min(1, "Please select a gender"),
  state: z.string().min(1, "Please select a state"),
});

export type PrimaryParticipantInput = z.infer<typeof primaryParticipantSchema>;
export type AdditionalParticipantInput = z.infer<typeof additionalParticipantSchema>;
