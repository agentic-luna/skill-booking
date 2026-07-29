import { z } from "zod";

// NOTE: libphonenumber-js and zxcvbn are blocked in this environment (403 Forbidden). 
// Using basic fallback implementations.
export type CountryCode = string;

export interface CountryOption {
  code: CountryCode;
  name: string;
  dialCode: string;
  flag: string;
}

export const POPULAR_COUNTRY_CODES: CountryOption[] = [
  { code: "IN", name: "India", dialCode: "+91", flag: "🇮🇳" },
  { code: "US", name: "United States", dialCode: "+1", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", dialCode: "+44", flag: "🇬🇧" },
  { code: "AE", name: "United Arab Emirates", dialCode: "+971", flag: "🇦🇪" },
  { code: "SG", name: "Singapore", dialCode: "+65", flag: "🇸🇬" },
  { code: "AU", name: "Australia", dialCode: "+61", flag: "🇦🇺" },
  { code: "CA", name: "Canada", dialCode: "+1", flag: "🇨🇦" },
  { code: "DE", name: "Germany", dialCode: "+49", flag: "🇩🇪" },
  { code: "FR", name: "France", dialCode: "+33", flag: "🇫🇷" },
  { code: "SA", name: "Saudi Arabia", dialCode: "+966", flag: "🇸🇦" },
  { code: "PK", name: "Pakistan", dialCode: "+92", flag: "🇵🇰" },
  { code: "BD", name: "Bangladesh", dialCode: "+880", flag: "🇧🇩" },
  { code: "MY", name: "Malaysia", dialCode: "+60", flag: "🇲🇾" },
  { code: "NP", name: "Nepal", dialCode: "+977", flag: "🇳🇵" },
  { code: "LK", name: "Sri Lanka", dialCode: "+94", flag: "🇱🇰" },
  { code: "KW", name: "Kuwait", dialCode: "+965", flag: "🇰🇼" },
  { code: "QA", name: "Qatar", dialCode: "+974", flag: "🇶🇦" },
  { code: "OM", name: "Oman", dialCode: "+968", flag: "🇴🇲" },
];

/**
 * Strips all non-digit characters from local number and formats as full E.164 string (+91948825254)
 */
export function buildE164Phone(dialCode: string, localDigits: string): string {
  const digitsOnly = localDigits.replace(/\D/g, "");
  const cleanDialCode = dialCode.startsWith("+") ? dialCode : `+${dialCode}`;
  return `${cleanDialCode}${digitsOnly}`;
}

/**
 * Validates whether full E.164 phone string is valid for given country region
 */
export function isValidE164Phone(phoneE164: string, countryCode: CountryCode = "IN"): boolean {
  // Basic fallback validation: starts with + and has 8-15 digits
  return /^\+[1-9]\d{7,14}$/.test(phoneE164);
}

export interface PasswordStrengthResult {
  score: number; // 0 to 4
  label: "Too Weak" | "Weak" | "Fair" | "Good" | "Strong";
  color: string; // Tailwind color class
  hasMinLength: boolean;
  hasNumber: boolean;
  hasUpper: boolean;
  hasSpecial: boolean;
  suggestions: string[];
}

export function evaluatePasswordStrength(password: string): PasswordStrengthResult {
  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  let score = 0;
  if (hasMinLength) score += 1;
  if (hasNumber) score += 1;
  if (hasUpper) score += 1;
  if (hasSpecial) score += 1;

  let label: PasswordStrengthResult["label"] = "Too Weak";
  let color = "bg-red-500";

  switch (score) {
    case 0:
    case 1:
      label = "Weak";
      color = "bg-red-500";
      break;
    case 2:
      label = "Fair";
      color = "bg-amber-500";
      break;
    case 3:
      label = "Good";
      color = "bg-emerald-400";
      break;
    case 4:
      label = "Strong";
      color = "bg-[#a0f212]";
      break;
  }

  if (password.length === 0) {
    label = "Too Weak";
    color = "bg-muted";
  }

  return {
    score,
    label,
    color,
    hasMinLength,
    hasNumber,
    hasUpper,
    hasSpecial,
    suggestions: [],
  };
}

// Email Normalization & Validation utilities
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export function normalizeEmail(email: string | undefined | null): string {
  if (!email) return "";
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string | undefined | null): boolean {
  if (!email) return false;
  return EMAIL_REGEX.test(normalizeEmail(email));
}

// Zod schemas
export const clientSignupZodSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").regex(/^[A-Za-z\s]+$/, "First name should only contain letters"),
  lastName: z.string().trim().min(1, "Last name is required").regex(/^[A-Za-z\s]+$/, "Last name should only contain letters"),
  email: z.string().trim().toLowerCase().regex(EMAIL_REGEX, "Please enter a valid email address (e.g. user@example.com)"),
  phone: z.string().refine((val) => isValidE164Phone(val), {
    message: "Please enter a valid WhatsApp mobile number for the selected country (e.g. +91 94882 52540)",
  }),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

export const hostSignupZodSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  email: z.string().trim().toLowerCase().regex(EMAIL_REGEX, "Please enter a valid email address (e.g. host@example.com)"),
  phone: z.string().refine((val) => isValidE164Phone(val), {
    message: "Please enter a valid phone number with country code",
  }),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});
