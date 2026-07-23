import { z } from "zod";
import parsePhoneNumberFromString, { CountryCode } from "libphonenumber-js";
import zxcvbn from "zxcvbn";

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
  try {
    const parsed = parsePhoneNumberFromString(phoneE164, countryCode);
    return !!parsed && parsed.isValid();
  } catch {
    return false;
  }
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
  const result = zxcvbn(password);
  const score = result.score; // 0-4

  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

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
    suggestions: result.feedback.suggestions || [],
  };
}

// Zod schemas
export const clientSignupZodSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").regex(/^[A-Za-z\s]+$/, "First name should only contain letters"),
  lastName: z.string().trim().min(1, "Last name is required").regex(/^[A-Za-z\s]+$/, "Last name should only contain letters"),
  phone: z.string().refine((val) => isValidE164Phone(val), {
    message: "Please enter a valid WhatsApp mobile number for the selected country (e.g. +91 94882 52540)",
  }),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

export const hostSignupZodSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().refine((val) => isValidE164Phone(val), {
    message: "Please enter a valid phone number with country code",
  }),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});
