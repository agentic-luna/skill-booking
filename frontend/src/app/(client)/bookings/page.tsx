"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookmarkCheck, ArrowLeft } from "lucide-react";

import { useAuthStore } from "@/features/auth/store/authStore";
import { useAlertStore } from "@/features/alerts/store/alertStore";
import { MOCK_BOOKINGS, Booking } from "@/constants/mockData";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";

import BookingTabs from "./_components/BookingTabs";
import CancelDialog from "./_components/CancelDialog";

export default function BookingsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const showAlert = useAlertStore((s) => s.showAlert);
  const [bookings, setBookings] = useState<Booking[]>(MOCK_BOOKINGS);
  const [cancellingBookingId, setCancellingBookingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) router.push("/login");
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="animate-pulse flex flex-col items-center space-y-4">
          <div className="w-12 h-12 bg-primary/20 rounded-full" />
          <div className="h-4 w-32 bg-muted rounded-md" />
        </div>
      </div>
    );
  }

  const handleConfirmCancel = () => {
    if (!cancellingBookingId) return;
    setBookings((prev) =>
      prev.map((bk) =>
        bk.id === cancellingBookingId ? { ...bk, status: "cancelled" as const } : bk
      )
    );
    const idx = MOCK_BOOKINGS.findIndex((b) => b.id === cancellingBookingId);
    if (idx !== -1) MOCK_BOOKINGS[idx] = { ...MOCK_BOOKINGS[idx], status: "cancelled" as const };
    setCancellingBookingId(null);
    showAlert(
      "Booking Cancelled",
      "Your reservation has been successfully cancelled. A 100% automatic refund has been initiated.",
      "success"
    );
  };

  const activeBookings = bookings.filter((b) => b.status === "confirmed");
  const pastBookings = bookings.filter((b) =>
    ["completed", "cancelled", "refunded"].includes(b.status)
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 bg-muted/10 dark:bg-card/5 py-8">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-6">

          <div className="space-y-1">
            <Link href="/home" className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground gap-1 pb-1 font-semibold">
              <ArrowLeft className="h-3 w-3" /> Back to feed
            </Link>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
              <BookmarkCheck className="h-6 w-6 text-primary" /> My Workshop Tickets
            </h1>
          </div>

          <BookingTabs
            activeBookings={activeBookings}
            pastBookings={pastBookings}
            onCancel={setCancellingBookingId}
          />
        </div>
      </main>

      <CancelDialog
        open={cancellingBookingId !== null}
        onClose={() => setCancellingBookingId(null)}
        onConfirm={handleConfirmCancel}
      />

      <Footer />
    </div>
  );
}
