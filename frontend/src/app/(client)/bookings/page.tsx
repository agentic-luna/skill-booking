"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookmarkCheck, ArrowLeft } from "lucide-react";

import { useAuthStore } from "@/features/auth/store/authStore";
import { useClientStore } from "@/features/client/store/clientStore";
import { useAlertStore } from "@/features/alerts/store/alertStore";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";

import BookingTabs from "./_components/BookingTabs";
import CancelDialog from "./_components/CancelDialog";
import WriteReviewModal from "./_components/WriteReviewModal";
import type { ClientBooking } from "@/features/client/api/types";

export default function BookingsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const showAlert = useAlertStore((s) => s.showAlert);

  const { bookings, fetchBookings, cancelBooking, loading } = useClientStore();

  const [cancellingBookingId, setCancellingBookingId] = useState<string | null>(null);
  const [reviewingBooking, setReviewingBooking] = useState<ClientBooking | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    fetchBookings();
  }, [isAuthenticated, router, fetchBookings]);

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

  const handleConfirmCancel = async () => {
    if (!cancellingBookingId) return;
    try {
      const result = await cancelBooking(cancellingBookingId);
      if (result.success) {
        showAlert(
          "Booking Cancelled",
          `Your reservation has been successfully cancelled. A dynamic refund of $${result.refundAmount || 0} was processed.`,
          "success"
        );
      } else {
        showAlert("Cancellation Issue", "We could not cancel this booking.", "warning");
      }
      setCancellingBookingId(null);
    } catch (err: any) {
      showAlert("Cancellation Error", err.message || "Failed to cancel ticket booking.", "destructive");
    }
  };

  const activeBookings = bookings.filter((b) => b.status === "CONFIRMED" || b.status === "PENDING");
  const pastBookings = bookings.filter((b) =>
    ["COMPLETED", "CANCELLED", "REFUNDED"].includes(b.status)
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
            onWriteReview={setReviewingBooking}
          />
        </div>
      </main>

      <CancelDialog
        open={cancellingBookingId !== null}
        onClose={() => setCancellingBookingId(null)}
        onConfirm={handleConfirmCancel}
      />

      <WriteReviewModal
        isOpen={reviewingBooking !== null}
        onOpenChange={(open) => {
          if (!open) setReviewingBooking(null);
        }}
        booking={reviewingBooking}
        onSuccess={() => fetchBookings()}
      />

      <Footer />
    </div>
  );
}
