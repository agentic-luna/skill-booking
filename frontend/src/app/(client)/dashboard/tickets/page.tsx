"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookmarkCheck } from "lucide-react";

import BackButton from "@/components/common/BackButton";

import { useAuthStore } from "@/features/auth/store/authStore";
import { useClientStore } from "@/features/client/store/clientStore";
import { useAlertStore } from "@/features/alerts/store/alertStore";
import Footer from "@/components/common/Footer";

import BookingTabs from "./_components/BookingTabs";
import CancelDialog from "./_components/CancelDialog";
import WriteReviewModal from "./_components/WriteReviewModal";
import type { ClientBooking } from "@/features/client/api/types";

export default function BookingsPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const showAlert = useAlertStore((s) => s.showAlert);

  const { bookings, fetchBookings, cancelBooking, loading } = useClientStore();

  const [cancellingBooking, setCancellingBooking] = useState<ClientBooking | null>(null);
  const [reviewingBooking, setReviewingBooking] = useState<ClientBooking | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    if (user?.role === "host") {
      router.push("/host/dashboard");
      return;
    }
    if (user?.role === "admin") {
      router.push("/dashboard/profile");
      return;
    }
    fetchBookings();
  }, [isAuthenticated, user, router, fetchBookings]);

  if (!isAuthenticated || user?.role === "host" || user?.role === "admin") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="animate-pulse flex flex-col items-center space-y-4">
          <div className="w-12 h-12 bg-primary/20 rounded-full" />
          <div className="h-4 w-32 bg-muted rounded-md" />
        </div>
      </div>
    );
  }

  const handleConfirmCancel = async (reason: string) => {
    if (!cancellingBooking) return;
    try {
      const result = await cancelBooking(cancellingBooking.id, reason);
      const refundAmt = result.refundAmount || 0;
      if (refundAmt > 0) {
        showAlert(
          "Cancellation Requested",
          `Your request has been submitted. A refund of ₹${refundAmt} (${result.refundPercentage}%) has been requested and is pending approval from the Super Admin.`,
          "success"
        );
      } else {
        showAlert(
          "Booking Cancelled",
          "Your reservation has been cancelled. No refund was applicable.",
          "success"
        );
      }
      setCancellingBooking(null);
    } catch (err: any) {
      showAlert("Cancellation Error", err.message || "Failed to cancel ticket booking.", "destructive");
    }
  };

  const activeBookings = bookings.filter((b) => b.status === "CONFIRMED" || b.status === "PENDING");
  const pastBookings = bookings.filter((b) =>
    ["COMPLETED", "CANCELLED", "CANCELED", "REFUNDED"].includes(b.status)
  );

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 pt-[104px] pb-8 bg-muted/10 dark:bg-card/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="space-y-1">
            <BackButton href="/" label="Back to feed" />
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
              <BookmarkCheck className="h-6 w-6 text-primary" /> My Workshop Tickets
            </h1>
          </div>

          <BookingTabs
            activeBookings={activeBookings}
            pastBookings={pastBookings}
            onCancel={setCancellingBooking}
            onWriteReview={setReviewingBooking}
          />
        </div>
      </main>

      <CancelDialog
        open={cancellingBooking !== null}
        onClose={() => setCancellingBooking(null)}
        booking={cancellingBooking}
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
