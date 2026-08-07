"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Program } from "@/constants/mockData";
import { useAuthStore } from "@/features/auth/store/authStore";
import { useAlertStore } from "@/features/alerts/store/alertStore";
import { useClientStore } from "@/features/client/store/clientStore";
import { useClientAuthModalStore } from "@/features/auth/store/clientAuthModalStore";
import { useBookingModalStore } from "@/features/client/store/bookingModalStore";
import { useRazorpayCheckout } from "@/features/payment/hooks/useRazorpayCheckout";

import BookingModal from "./BookingModal";
import BackButton from "@/components/common/BackButton";
import AdvancedSearchBar from "@/components/hero-section/AdvancedSearchBar";

// Import the newly extracted components
import { mapEventToProgram } from "@/utils/mapEventToProgram";
import ProgramVideoPlayer from "@/components/program-details/ProgramVideoPlayer";
import ProgramHighlights from "@/components/program-details/ProgramHighlights";
import { FeaturedBadge, ProBoostBadge, UltraProBadge, FeaturedOrganizerBadge } from "@/components/common/BoostBadges";
import InstructorProfile from "@/components/program-details/InstructorProfile";
import BookingSidebar from "@/components/program-details/BookingSidebar";
import MobileBookingBar from "@/components/program-details/MobileBookingBar";
import ProgramReviews from "@/components/program-details/ProgramReviews";

interface ProgramDetailsProps {
  programId: string;
  initialProgram?: Program | undefined;
}

export default function ProgramDetailsContent({ programId, initialProgram }: ProgramDetailsProps) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [program, setProgram] = useState<Program | undefined>(initialProgram);

  // States
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const openClientAuthModal = useClientAuthModalStore((s) => s.openModal);

  const {
    fetchEventDetails,
    checkoutBooking,
    wishlist,
    fetchWishlist,
    addToWishlist,
    removeFromWishlist,
    reviews,
    reviewsTotalCount,
    reviewsStats,
    fetchHostReviews
  } = useClientStore();

  const { startCheckout, isLoading: rzpLoading } = useRazorpayCheckout({
    onSuccess: (result) => {
      setPaymentLoading(false);
      setProgram((prev) =>
        prev ? { ...prev, spotsLeft: Math.max(0, prev.spotsLeft - (result.booking?.seatCount ?? 1)) } : prev
      );
      setPaymentSuccess(true);
      showAlert(
        "Booking Confirmed!",
        `Your booking for "${program?.title}" has been confirmed. Check your email for details.`,
        "success"
      );
    },
    onError: (msg) => {
      setPaymentLoading(false);
      showAlert("Payment Error", msg, "destructive");
    },
  });

  const [reviewsPage, setReviewsPage] = useState(1);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const showAlert = useAlertStore((s) => s.showAlert);

  useEffect(() => {
    if (initialProgram) {
      setProgram(initialProgram);
    }
  }, [initialProgram]);

  useEffect(() => {
    if (program?.hostId && program.hostId !== "preview") {
      fetchHostReviews(program.hostId, reviewsPage, 5, selectedRating || undefined);
    }
  }, [program?.hostId, reviewsPage, selectedRating, fetchHostReviews]);

  useEffect(() => {
    if (programId === "preview") {
      setLoading(false);
      return;
    }
    let active = true;
    const loadDetails = async () => {
      try {
        setLoading(true);
        const details = await fetchEventDetails(programId);
        if (active) {
          setProgram(mapEventToProgram(details));
          setError(null);
        }
      } catch (err: any) {
        if (active) {
          setError(err.message || "Failed to load program details");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadDetails();
    if (isAuthenticated) {
      fetchWishlist();
    }

    return () => {
      active = false;
    };
  }, [programId, fetchEventDetails, fetchWishlist, isAuthenticated]);

  useEffect(() => {
    if (program && wishlist) {
      const wishlisted = wishlist.some((item) => item.eventId === program.id);
      setIsWishlisted(wishlisted);
    }
  }, [program, wishlist]);

  // Razorpay script is loaded inside useRazorpayCheckout hook when needed

  if (loading && !program) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-16 text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground text-sm font-semibold">Loading workshop details...</p>
      </div>
    );
  }

  if (error && !program) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
        <h3 className="text-xl font-bold text-destructive">Error Loading Program</h3>
        <p className="text-muted-foreground text-sm max-w-sm">{error}</p>
        <Link href="/programs">
          <Button>Back to Marketplace</Button>
        </Link>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
        <h3 className="text-xl font-bold text-foreground">Program Not Found</h3>
        <p className="text-muted-foreground text-sm max-w-sm">
          We couldn&apos;t load the training details. It may have been removed or rejected.
        </p>
        <Link href="/programs">
          <Button>Back to Marketplace</Button>
        </Link>
      </div>
    );
  }

  const handleBookClick = async () => {
    if (!program) return;
    try {
      // Fetch latest event details to verify status before booking
      const details = await fetchEventDetails(program.id);
      const latestProgram = mapEventToProgram(details);

      const isFinished =
        latestProgram.status?.toLowerCase() === "completed" ||
        latestProgram.status?.toLowerCase() === "finished" ||
        latestProgram.status?.toLowerCase() === "cancelled" ||
        latestProgram.status?.toLowerCase() === "canceled" ||
        (latestProgram.startTime ? new Date(latestProgram.startTime) < new Date() : false);

      if (isFinished) {
        showAlert("Workshop Concluded", "This event has already finished and is no longer accepting bookings.", "destructive");
        setProgram(latestProgram);
        return;
      }

      if (latestProgram.spotsLeft === 0) {
        showAlert("Registration Closed", "All seats for this workshop have been booked.", "destructive");
        setProgram(latestProgram);
        return;
      }

      setProgram(latestProgram);

      if (!isAuthenticated) {
        openClientAuthModal("login", () => {
          useBookingModalStore.getState().openBookingModal(latestProgram, useAuthStore.getState().user);
          setCheckoutOpen(true);
        });
        return;
      }
      useBookingModalStore.getState().openBookingModal(latestProgram, user);
      setCheckoutOpen(true);
    } catch (err: any) {
      showAlert("Error", "Could not verify event status. Please try again.", "destructive");
    }
  };

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      openClientAuthModal("login", () => handleWishlistToggle());
      return;
    }

    try {
      if (isWishlisted) {
        await removeFromWishlist(program.id);
        showAlert("Removed from Wishlist", "The workshop has been removed from your saved list.", "info");
      } else {
        await addToWishlist(program.id);
        showAlert("Added to Wishlist", "The workshop has been added to your saved list successfully.", "success");
      }
    } catch (err: any) {
      showAlert("Error", err.message || "Failed to update wishlist.", "destructive");
    }
  };

  const handleConfirmBooking = async (spotsCount: number) => {
    if (!program) return;
    setPaymentLoading(true);
    const store = useBookingModalStore.getState();
    const formattedParticipants = store.getFormattedParticipants();
    const primary = store.primary;

    try {
      await startCheckout(
        {
          eventId: program.id,
          seatCount: spotsCount,
          participants: formattedParticipants,
        },
        {
          name: primary.fullName || user?.name || `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "Guest",
          email: primary.email || user?.email || "",
          phone: primary.mobile || user?.phone || "",
        }
      );
    } catch {
      // errors handled by useRazorpayCheckout's onError callback
    }
  };

  const handleShareClick = () => {
    navigator.clipboard.writeText(window.location.href);
    showAlert(
      "Link Copied",
      "Class link has been successfully copied to your clipboard. Send it to your friends!",
      "success"
    );
  };

  return (
    <main className="flex-1 pt-[104px] pb-28 lg:pb-16 bg-muted/10 dark:bg-card/5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">

        {/* Back Link */}
        <BackButton href="/" label="Back to explore" />

        {/* Booking.com Style Search Bar */}
        <div className="w-full relative z-30 flex justify-center">
          <div className="w-full max-w-4xl shadow-xl shadow-gray-200/50 rounded-[32px] bg-white border border-gray-100">
            <AdvancedSearchBar />
          </div>
        </div>

        {/* Dynamic Detail layout columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">

          {/* Left Column (Details) */}
          <div className="lg:col-span-2 space-y-8">

            {/* Header info */}
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="inline-block text-[10px] tracking-widest font-extrabold text-white bg-[#0b0c01] border border-[#a0f212]/20 px-3 py-1.5 rounded-full uppercase shadow-sm">
                  {program.category}
                </span>
                {program.isBoosted && (
                  program.boostTier === "PRO" ? <UltraProBadge /> :
                  program.boostTier === "STANDARD" ? <ProBoostBadge /> :
                  <FeaturedBadge />
                )}
                {program.hasFeaturedOrganizerBadge && (
                  <FeaturedOrganizerBadge />
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight leading-tight">
                {program.title}
              </h1>
            </div>

            {/* Core Banner Image */}
            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-muted border">
              <img
                src={program.imageUrl}
                alt={program.title}
                className="object-cover w-full h-full animate-in fade-in duration-300"
              />
            </div>

            {/* Embedded Videos */}
            <ProgramVideoPlayer videoUrls={program.videoUrls} />

            {/* Syllabus Description */}
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">Workshop Details</h2>
              <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
                {program.description}
              </p>
            </div>

            {/* Highlights (Rating & Location Map) */}
            <ProgramHighlights
              rating={program.rating}
              reviewsCount={program.reviewsCount}
              location={program.location}
              mode={program.mode}
            />

            <Separator />

            {/* Instructor Details */}
            <InstructorProfile
              instructorName={program.instructorName}
              instructorAvatar={program.instructorAvatar}
              instructorBio={program.instructorBio}
              companyName={program.companyName}
              instagram={program.instagram}
              linkedin={program.linkedin}
              facebook={program.facebook}
            />

            <Separator />

            {/* Verified Student Reviews List */}
            <ProgramReviews
              reviews={reviews}
              reviewsTotalCount={reviewsTotalCount}
              reviewsPage={reviewsPage}
              setReviewsPage={setReviewsPage}
              reviewsStats={reviewsStats}
              selectedRating={selectedRating}
              setSelectedRating={setSelectedRating}
            />
          </div>

          {/* Right Column (Ticket Registration Box) */}
          <div className="col-span-1">
            <BookingSidebar
              program={program}
              user={user}
              isWishlisted={isWishlisted}
              onBookClick={handleBookClick}
              onWishlistToggle={handleWishlistToggle}
              onShareClick={handleShareClick}
            />
          </div>
        </div>
      </div>

      {/* BOOKING MODAL */}
      <BookingModal
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        program={program}
        onConfirmBooking={handleConfirmBooking}
        paymentLoading={paymentLoading}
        paymentSuccess={paymentSuccess}
        onClose={() => {
          setCheckoutOpen(false);
          setPaymentSuccess(false);
        }}
      />

      {/* Sticky Mobile Booking Bottom Bar */}
      <MobileBookingBar
        program={program}
        user={user}
        onBookClick={handleBookClick}
      />
    </main>
  );
}
