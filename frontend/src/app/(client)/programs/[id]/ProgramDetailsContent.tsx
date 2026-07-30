"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Star, Clock, MapPin, Calendar, Heart, Share2, ShieldCheck, 
  ChevronLeft, ChevronRight, Ticket, Loader2,
  Instagram, Linkedin, Facebook
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Program, MOCK_PROGRAMS, MOCK_BOOKINGS, Booking } from "@/constants/mockData";
import { useAuthStore } from "@/features/auth/store/authStore";
import { useAlertStore } from "@/features/alerts/store/alertStore";
import { useClientStore } from "@/features/client/store/clientStore";
import { useClientAuthModalStore } from "@/features/auth/store/clientAuthModalStore";
import { useBookingModalStore } from "@/features/client/store/bookingModalStore";
import BookingModal from "./BookingModal";
import BackButton from "@/components/common/BackButton";
import AdvancedSearchBar from "@/components/hero-section/AdvancedSearchBar";

function mapEventToProgram(event: any): Program {
  const hostUser = event.host?.user;
  const isObj = typeof event.venueDetails === "object" && event.venueDetails !== null;
  
  const instructorName = (isObj && event.venueDetails.instructorName)
    ? event.venueDetails.instructorName
    : event.trainerName || (hostUser ? `${hostUser.firstName} ${hostUser.lastName}` : "Instructor");
    
  const instructorAvatar = (isObj && event.venueDetails.instructorPhoto)
    ? event.venueDetails.instructorPhoto
    : hostUser?.avatarUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face";
    
  const instructorBio = (isObj && event.venueDetails.instructorBio)
    ? event.venueDetails.instructorBio
    : "Sarah is a seasoned educational director with over 10 years of experience launching immersive programs. She focuses on hands-on practical teaching setups.";

  const instagram = (isObj && event.venueDetails.instagram) ? event.venueDetails.instagram : "";
  const linkedin = (isObj && event.venueDetails.linkedin) ? event.venueDetails.linkedin : "";
  const facebook = (isObj && event.venueDetails.facebook) ? event.venueDetails.facebook : "";
  const companyName = (isObj && event.venueDetails.companyName) ? event.venueDetails.companyName : "Training Masterclass Ltd.";

  const locationStr = event.mode === "ONLINE"
    ? "Online"
    : typeof event.venueDetails === "string"
      ? event.venueDetails
      : event.venueDetails?.address || "In Person";
  const imageUrlStr = event.posterUrl || event.images?.[0] || "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=600";

  return {
    id: event.id,
    title: event.title,
    description: event.description || "",
    instructorName,
    instructorAvatar,
    instructorBio,
    instagram,
    linkedin,
    facebook,
    companyName,
    category: event.category || "technology",
    videoUrls: event.videoUrls || [],
    rating: 4.8,
    reviewsCount: event._count?.bookings || 12,
    price: event.price || 0,
    duration: event.duration || "2 hours",
    date: (() => {
      if (!event.startTime) return "2026-07-12";
      const startStr = event.startTime.split("T")[0];
      const endDateVal = (event.venueDetails as any)?.endDate;
      if (endDateVal && endDateVal !== startStr) {
        return `${startStr} to ${endDateVal}`;
      }
      return startStr;
    })(),
    time: event.startTime 
      ? new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " EST"
      : "10:00 AM EST",
    spotsLeft: event.availableSeats ?? 0,
    maxSpots: event.totalSeats ?? 20,
    location: locationStr,
    imageUrl: imageUrlStr,
    status: event.status ? event.status.toLowerCase() : "approved",
    featured: true,
    mode: event.mode,
    commission: event.commission,
  };
}

interface ProgramDetailsProps {
  programId: string;
  initialProgram?: Program | undefined;
}

export default function ProgramDetailsContent({ programId, initialProgram }: ProgramDetailsProps) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [program, setProgram] = useState<Program | undefined>(
    initialProgram || MOCK_PROGRAMS.find((p) => p.id === programId)
  );

  // States
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const openClientAuthModal = useClientAuthModalStore((s) => s.openModal);

  const { 
    fetchEventDetails, 
    checkoutBooking, 
    confirmPayment, 
    wishlist, 
    fetchWishlist, 
    addToWishlist, 
    removeFromWishlist 
  } = useClientStore();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialProgram) {
      setProgram(initialProgram);
    }
  }, [initialProgram]);

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

  const showAlert = useAlertStore((s) => s.showAlert);

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

  const handleBookClick = () => {
    if (!isAuthenticated) {
      openClientAuthModal("login", () => {
        useBookingModalStore.getState().openBookingModal(program, useAuthStore.getState().user);
        setCheckoutOpen(true);
      });
      return;
    }
    useBookingModalStore.getState().openBookingModal(program, user);
    setCheckoutOpen(true);
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
    try {
      const checkoutResult = await checkoutBooking({
        eventId: program.id,
        seatCount: spotsCount,
      });
      if (!checkoutResult || !checkoutResult.booking) {
        throw new Error("Could not initialize checkout booking process");
      }
      const confirmResult = await confirmPayment(checkoutResult.booking.id, {
        paymentMethod: "CARD",
      });
      if (confirmResult.success) {
        setProgram((prev) => prev ? { ...prev, spotsLeft: Math.max(0, prev.spotsLeft - spotsCount) } : prev);
        setPaymentSuccess(true);
        showAlert(
          "Booking Confirmed!",
          `Your ${spotsCount} seat${spotsCount > 1 ? "s" : ""} for "${program.title}" have been reserved. Check your email for the confirmation and invoice.`,
          "success"
        );
      } else {
        showAlert("Payment Failed", "Could not confirm booking payment.", "destructive");
      }
    } catch (err: any) {
      showAlert("Checkout Error", err.message || "Failed to finalize booking.", "destructive");
    } finally {
      setPaymentLoading(false);
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
            <div className="space-y-3">
              <span className="inline-block text-[10px] tracking-widest font-extrabold text-white bg-[#0b0c01] border border-[#a0f212]/20 px-3 py-1.5 rounded-full uppercase shadow-sm">
                {program.category}
              </span>
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

            {(() => {
              const videos = program.videoUrls && program.videoUrls.length > 0
                ? program.videoUrls
                : ["https://www.youtube.com/embed/tgbNymZ7vqY"];

              const getEmbedUrl = (url: string): string => {
                if (!url) return "";
                if (url.includes("youtube.com/embed/")) return url;
                let videoId = "";
                try {
                  if (url.includes("youtu.be/")) {
                    videoId = url.split("youtu.be/")[1]?.split(/[?#]/)[0] || "";
                  } else if (url.includes("youtube.com/watch")) {
                    const parts = url.split("v=");
                    if (parts[1]) {
                      videoId = parts[1].split("&")[0];
                    }
                  } else if (url.includes("youtube.com/shorts/")) {
                    videoId = url.split("youtube.com/shorts/")[1]?.split(/[?#]/)[0] || "";
                  }
                } catch (e) {}
                return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
              };

              const activeEmbedUrl = getEmbedUrl(videos[activeVideoIndex]);

              return (
                <div className="space-y-4 mt-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-foreground">Introductory Videos</h2>
                    {videos.length > 1 && (
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-full"
                          onClick={() => setActiveVideoIndex((prev) => (prev > 0 ? prev - 1 : videos.length - 1))}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-xs font-medium text-muted-foreground">
                          {activeVideoIndex + 1} / {videos.length}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-full"
                          onClick={() => setActiveVideoIndex((prev) => (prev < videos.length - 1 ? prev + 1 : 0))}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  <div className="max-w-[320px] xs:max-w-md sm:max-w-lg md:max-w-xl mx-auto aspect-video w-full rounded-2xl overflow-hidden bg-muted shadow-sm border border-border/30">
                    <iframe 
                      key={videos[activeVideoIndex]}
                      width="100%" 
                      height="100%" 
                      src={activeEmbedUrl} 
                      title={`YouTube video player ${activeVideoIndex + 1}`}
                      frameBorder="0" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowFullScreen
                    ></iframe>
                  </div>
                </div>
              );
            })()}

            {/* Syllabus Description */}
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">Workshop Details</h2>
              <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
                {program.description}
              </p>
            </div>

            {/* Large Highlighted Key Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
              {/* Rating Spec */}
              <Card className="rounded-2xl border-border/40 bg-card overflow-hidden shadow-2xs">
                <CardContent className="p-5 flex items-center space-x-4">
                  <div className="bg-amber-500/10 text-amber-500 p-3.5 rounded-xl shrink-0">
                    <Star className="h-6 w-6 fill-amber-500 text-amber-500" />
                  </div>
                  <div>
                    <div className="text-2xl font-black text-foreground leading-none flex items-baseline space-x-1">
                      <span>{program.rating}</span>
                      <span className="text-[10px] font-bold text-muted-foreground">/ 5.0</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground font-bold mt-1 uppercase tracking-wide">
                      {program.reviewsCount} Verified Learner Reviews
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Location Spec */}
              <Card className="rounded-2xl border-border/40 bg-card overflow-hidden shadow-2xs">
                <CardContent className="p-5 flex items-center space-x-4">
                  <div className="bg-primary/10 text-primary p-3.5 rounded-xl shrink-0">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Class Venue</div>
                    <div className="text-xs font-extrabold text-foreground mt-1 leading-snug break-words line-clamp-2" title={program.location}>
                      {program.location}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {program.mode === "OFFLINE" && program.location && program.location !== "In Person" && (
              <div className="space-y-3 pt-2">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>Venue Map Direction</span>
                </h3>
                <div className="w-full h-[250px] rounded-2xl overflow-hidden border border-border/40 bg-muted/30 shadow-xs relative">
                  <iframe
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://www.google.com/maps?q=${encodeURIComponent(program.location)}&output=embed`}
                  />
                </div>
                <Button variant="outline" size="sm" asChild className="w-full h-10 rounded-xl text-xs font-semibold shadow-2xs">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(program.location)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5"
                  >
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    <span>Get Directions on Google Maps</span>
                  </a>
                </Button>
              </div>
            )}

            <Separator />

            {/* Instructor Details */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-foreground">Meet Your Instructor</h2>
              <Card className="rounded-xl border-border/40 overflow-hidden bg-card/50">
                <CardContent className="p-6 flex items-start space-x-4">
                  <img
                    src={program.instructorAvatar}
                    alt={program.instructorName}
                    className="h-14 w-14 rounded-full object-cover ring-2 ring-primary/20 shrink-0"
                  />
                  <div className="space-y-2">
                    <div>
                      <h3 className="font-bold text-sm text-foreground">{program.instructorName}</h3>
                      <span className="text-[10px] text-muted-foreground">{program.companyName}</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
                      {program.instructorBio}
                    </p>
                    <div className="flex items-center space-x-3 text-xs text-primary font-semibold">
                      <span>4.9★ Host Rating</span>
                      <span>•</span>
                      <span>{program.companyName}</span>
                    </div>
                    {(program.instagram || program.linkedin || program.facebook) && (
                      <div className="flex items-center gap-3.5 pt-2 mt-1 border-t border-border/30">
                        {program.instagram && (
                          <a
                            href={program.instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-pink-500 transition-colors p-0.5"
                            title="Instagram"
                          >
                            <Instagram className="h-4 w-4" />
                          </a>
                        )}
                        {program.linkedin && (
                          <a
                            href={program.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-blue-500 transition-colors p-0.5"
                            title="LinkedIn"
                          >
                            <Linkedin className="h-4 w-4" />
                          </a>
                        )}
                        {program.facebook && (
                          <a
                            href={program.facebook}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-blue-600 transition-colors p-0.5"
                            title="Facebook"
                          >
                            <Facebook className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

          </div>

          {/* Right Column (Ticket Registration Box) */}
          <div className="col-span-1">
            <div className="sticky top-24 bg-card border border-border/40 rounded-2xl p-6 shadow-md space-y-6">
              {(() => {
                const maxSpots = program.maxSpots || 10;
                const spotsLeft = program.spotsLeft ?? 0;
                const bookedSeats = Math.max(0, maxSpots - spotsLeft);
                const fillPercentage = maxSpots > 0 ? Math.round((bookedSeats / maxSpots) * 100) : 0;

                return (
                  <>
                    <div className="flex justify-between items-end border-b pb-4">
                      <div>
                        <span className="text-xs text-muted-foreground">Registration Fee</span>
                        <div className="text-2xl font-extrabold text-foreground">₹{program.price}</div>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                          spotsLeft <= 5 ? "bg-destructive/10 text-destructive" : "bg-emerald-500/10 text-emerald-600"
                        }`}>
                          {spotsLeft === 0 ? "Fully Booked" : `${spotsLeft} spots left`}
                        </span>
                      </div>
                    </div>

                    {/* Scarcity / Tension Creation Card */}
                    <div className="space-y-3">
                      {spotsLeft === 0 ? (
                        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-3 flex gap-2.5 items-start text-red-700 dark:text-red-400 text-xs font-semibold">
                          <span className="text-base leading-none">🚫</span>
                          <div className="space-y-0.5 w-full">
                            <p className="font-extrabold text-foreground leading-none">Registration Closed</p>
                            <p className="text-[10px] text-muted-foreground leading-relaxed">All seats are booked. Wishlist the workshop to get alerted on cancellations.</p>
                          </div>
                        </div>
                      ) : spotsLeft <= 5 ? (
                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex flex-col gap-2 text-amber-700 dark:text-amber-400 text-xs font-semibold animate-pulse">
                          <div className="flex gap-2.5 items-start">
                            <span className="text-base leading-none">🔥</span>
                            <div className="space-y-0.5">
                              <p className="font-extrabold text-amber-800 dark:text-amber-300 leading-none">Extremely Limited Seats!</p>
                              <p className="text-[10px] text-amber-700/80 dark:text-amber-400/80 leading-relaxed">Only {spotsLeft} of {maxSpots} spots remaining. Complete payment now to guarantee your registration.</p>
                            </div>
                          </div>
                          {/* Visual Progress Bar */}
                          <div className="space-y-1 pt-1 border-t border-amber-500/10">
                            <div className="flex justify-between text-[9px] text-amber-800/60 dark:text-amber-400/60 font-bold uppercase tracking-wider">
                              <span>Seats Taken</span>
                              <span>{fillPercentage}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-amber-500/10 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-amber-500 rounded-full" 
                                style={{ width: `${fillPercentage}%` }} 
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex flex-col gap-2 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
                          <div className="flex gap-2.5 items-start">
                            <span className="text-base leading-none">⚡</span>
                            <div className="space-y-0.5">
                              <p className="font-extrabold text-emerald-800 dark:text-emerald-300 leading-none">High Demand Event</p>
                              <p className="text-[10px] text-emerald-700/80 dark:text-emerald-400/80 leading-relaxed">{bookedSeats} of {maxSpots} slots are taken. Secure your reservation before registration closes.</p>
                            </div>
                          </div>
                          {/* Visual Progress Bar */}
                          <div className="space-y-1 pt-1 border-t border-emerald-500/10">
                            <div className="flex justify-between text-[9px] text-emerald-800/60 dark:text-emerald-400/60 font-bold uppercase tracking-wider">
                              <span>Seats Taken</span>
                              <span>{fillPercentage}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-emerald-500/10 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-emerald-600 rounded-full" 
                                style={{ width: `${fillPercentage}%` }} 
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Booking Info Grid */}
                    <div className="space-y-4 text-xs text-muted-foreground">
                      <div className="flex items-center">
                        <Calendar className="h-4.5 w-4.5 text-foreground mr-3 shrink-0" />
                        <div>
                          <div className="font-bold text-foreground">Date</div>
                          <div>{program.date}</div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4.5 w-4.5 text-foreground mr-3 shrink-0" />
                        <div>
                          <div className="font-bold text-foreground">Schedule Time & Duration</div>
                          <div>{program.time} • <span className="font-semibold text-foreground">{program.duration}</span></div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Ticket className="h-4.5 w-4.5 text-foreground mr-3 shrink-0" />
                        <div>
                          <div className="font-bold text-foreground">Total Capacity</div>
                          <div>{maxSpots} seats cap ({spotsLeft} available)</div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4.5 w-4.5 text-foreground mr-3 shrink-0" />
                        <div>
                          <div className="font-bold text-foreground">Location Venue</div>
                          <div className="text-foreground leading-relaxed break-words">{program.location}</div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2 pt-2">
                      {user?.role === "host" || user?.role === "admin" ? (
                        <div className="space-y-2.5">
                          <div className="text-center p-3 bg-muted/30 rounded-xl border text-[11px] text-muted-foreground font-bold">
                            Booking disabled for {user.role === "admin" ? "Admin" : "Host"} accounts
                          </div>
                          <Button variant="outline" className="w-full rounded-xl h-11 text-xs text-foreground border-border/60 hover:bg-muted/50 transition-colors shadow-sm" onClick={handleShareClick}>
                            <Share2 className="mr-1.5 h-4 w-4" /> Share Event
                          </Button>
                        </div>
                      ) : (
                        <>
                          <Button 
                            className="w-full rounded-xl py-6 text-sm font-semibold shadow-md shadow-primary/10"
                            disabled={spotsLeft === 0}
                            onClick={handleBookClick}
                          >
                            {spotsLeft === 0 ? "Registration Closed" : "Book Spot Now"}
                          </Button>
                          
                          <div className="grid grid-cols-2 gap-2">
                            <Button variant="outline" className="rounded-xl h-10 text-xs text-foreground border-border/60 hover:bg-muted/50 transition-colors shadow-sm" onClick={handleWishlistToggle}>
                              <Heart className={`mr-1.5 h-4 w-4 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`} /> 
                              {isWishlisted ? "Wishlisted" : "Wishlist"}
                            </Button>
                            <Button variant="outline" className="rounded-xl h-10 text-xs text-foreground border-border/60 hover:bg-muted/50 transition-colors shadow-sm" onClick={handleShareClick}>
                              <Share2 className="mr-1.5 h-4 w-4" /> Share Event
                            </Button>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Trust badges */}
                    <div className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground pt-2 text-center">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                      <span>100% Secure Checkout & Refund Guarantee</span>
                    </div>
                  </>
                );
              })()}
            </div>
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
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t border-border/50 p-4 pb-safe-bottom shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-between gap-4 max-w-md mx-auto">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/80">Price</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black text-foreground">₹{program.price}</span>
              {program.spotsLeft > 0 && (
                <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-950/20 px-1.5 py-0.5 rounded-md animate-pulse">
                  🔥 {program.spotsLeft} left
                </span>
              )}
            </div>
          </div>
          <div className="flex-1 max-w-[200px]">
            {user?.role === "host" || user?.role === "admin" ? (
              <div className="text-[9px] font-extrabold text-muted-foreground text-center bg-muted/40 p-2 rounded-xl border">
                Disabled for {user.role}
              </div>
            ) : (
              <Button
                className="w-full rounded-xl py-5 text-xs font-bold shadow-md shadow-primary/10"
                disabled={program.spotsLeft === 0}
                onClick={handleBookClick}
              >
                {program.spotsLeft === 0 ? "Closed" : "Book Spot"}
              </Button>
            )}
          </div>
        </div>
      </div>

    </main>
  );
}
