// ─── Shared types, constants, and helpers for the Booking Modal flow ──────────

export interface ParticipantDetail {
  fullName: string;
  email: string;
  mobile: string;
  age: string;
  gender: string;
}

export interface PrimaryParticipant {
  fullName: string;
  email: string;
  mobile: string;
  dob: string;
  gender: string;
  city: string;
  state: string;
  country: string;
}

export interface BookingSummary {
  programFee: number;
  discount: number;
  platformFee: number;
  taxes: number;
  total: number;
}

export interface BookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  program: import("@/constants/mockData").Program;
  onConfirmBooking: (spotsCount: number) => Promise<void>;
  paymentLoading: boolean;
  paymentSuccess: boolean;
  onClose: () => void;
}

// ─── Step labels ──────────────────────────────────────────────────────────────
export const BOOKING_STEPS = [
  "Participants",
  "Primary Details",
  "Payment",
  "Confirm",
] as const;

// ─── Fee constants ─────────────────────────────────────────────────────────────
export const PLATFORM_FEE_RATE = 0.025; // 2.5%
export const TAX_RATE = 0.18;           // 18% GST

// ─── Fee calculator ────────────────────────────────────────────────────────────
export function calcSummary(price: number, qty: number): BookingSummary {
  const programFee = price * qty;
  const discount = 0;
  const platformFee = Math.round(programFee * PLATFORM_FEE_RATE * 100) / 100;
  const taxable = programFee - discount + platformFee;
  const taxes = Math.round(taxable * TAX_RATE * 100) / 100;
  const total = taxable + taxes;
  return { programFee, discount, platformFee, taxes, total };
}

// ─── Primary participant validator ─────────────────────────────────────────────
export function validatePrimaryParticipant(
  primary: PrimaryParticipant
): Partial<Record<keyof PrimaryParticipant, string>> {
  const errs: Partial<Record<keyof PrimaryParticipant, string>> = {};
  if (!primary.fullName.trim()) errs.fullName = "Full name is required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(primary.email)) errs.email = "Valid email is required";
  if (!/^\+?[\d\s-]{7,15}$/.test(primary.mobile)) errs.mobile = "Valid mobile number is required";
  if (!primary.dob) errs.dob = "Date of birth is required";
  if (!primary.gender) errs.gender = "Gender is required";
  if (!primary.city.trim()) errs.city = "City is required";
  return errs;
}
