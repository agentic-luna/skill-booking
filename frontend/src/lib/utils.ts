import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateBookedSeats(total: number = 0, available: number = 0): number {
  return Math.max(0, total - available);
}
