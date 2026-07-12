"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  Star, Clock, MapPin, Calendar, Heart, Share2, ShieldCheck, 
  CheckCircle2, CreditCard, ChevronLeft, Ticket, Loader2 
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle 
} from "@/components/ui/dialog";
import { Program, MOCK_PROGRAMS, MOCK_BOOKINGS, Booking } from "@/constants/mockData";
import { useAuthStore } from "@/features/auth/store/authStore";
import { useAlertStore } from "@/features/alerts/store/alertStore";
import { useClientStore } from "@/features/client/store/clientStore";

function mapEventToProgram(event: any): Program {
  const hostUser = event.host?.user;
  const instructorName = event.trainerName || (hostUser ? `${hostUser.firstName} ${hostUser.lastName}` : "Instructor");
  const instructorAvatar = hostUser?.avatarUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face";
  const locationStr = event.mode === "ONLINE" ? "Online" : (event.venueDetails?.address || "In Person");
  const imageUrlStr = event.posterUrl || event.images?.[0] || "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=600";

  return {
    id: event.id,
    title: event.title,
    description: event.description || "",
    instructorName,
    instructorAvatar,
    category: event.category || "technology",
    rating: 4.8,
    reviewsCount: event._count?.bookings || 12,
    price: event.price || 0,
    duration: event.duration || "2 hours",
    date: event.startTime ? event.startTime.split("T")[0] : "2026-07-12",
    time: event.startTime 
      ? new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " EST"
      : "10:00 AM EST",
    spotsLeft: event.availableSeats ?? 0,
    maxSpots: event.totalSeats ?? 20,
    location: locationStr,
    imageUrl: imageUrlStr,
    status: event.status ? event.status.toLowerCase() : "approved",
    featured: true,
  };
}

// Zod schema for card payment validation
const checkoutSchema = z.object({
  cardholderName: z.string().min(3, "Cardholder name must be at least 3 characters"),
  cardNumber: z.string().regex(/^\d{16}$/, "Card number must be exactly 16 digits"),
  expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Expiry format must be MM/YY"),
  cvv: z.string().regex(/^\d{3}$/, "CVV must be exactly 3 digits"),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

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
  const [spotsCount, setSpotsCount] = useState(1);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

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

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      cardholderName: "",
      cardNumber: "",
      expiryDate: "",
      cvv: "",
    },
  });

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
          We couldn&apos;t load the skill training details. It may have been removed or rejected.
        </p>
        <Link href="/programs">
          <Button>Back to Marketplace</Button>
        </Link>
      </div>
    );
  }

  const handleBookClick = () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/programs/${programId}`);
      return;
    }
    setCheckoutOpen(true);
  };

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/programs/${programId}`);
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

  const onCheckoutSubmit = async (data: CheckoutFormValues) => {
    if (!program) return;
    setPaymentLoading(true);
    try {
      // 1. Call checkout API to create the booking reservation
      const checkoutResult = await checkoutBooking({
        eventId: program.id,
        seatCount: spotsCount,
      });

      // 2. Confirm the payment (CARD method)
      const confirmResult = await confirmPayment(checkoutResult.booking.id, {
        paymentMethod: "CARD",
      });

      if (confirmResult.success) {
        setProgram((prev) => prev ? { ...prev, spotsLeft: Math.max(0, prev.spotsLeft - spotsCount) } : prev);
        setPaymentSuccess(true);
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
    <main className="flex-1 pt-[104px] pb-8 bg-muted/10 dark:bg-card/5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Back Link */}
        <Link href="/programs" className="inline-flex items-center text-xs font-semibold text-muted-foreground hover:text-foreground gap-1 transition-colors">
          <ChevronLeft className="h-4 w-4" /> Back to explore
        </Link>

        {/* Dynamic Detail layout columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
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
                      {program.reviewsCount} Verified Roster Reviews
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
                      <span className="text-[10px] text-muted-foreground">Certified Masterclass Coach</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Sarah is a seasoned educational director with over 10 years of experience launching immersive programs. She focuses on hands-on practical teaching setups.
                    </p>
                    <div className="flex items-center space-x-3 text-xs text-primary font-semibold">
                      <span>4.9★ Coach Rating</span>
                      <span>•</span>
                      <span>500+ Students Taught</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

          </div>

          {/* Right Column (Ticket Registration Box) */}
          <div className="col-span-1">
            <div className="sticky top-24 bg-card border border-border/40 rounded-2xl p-6 shadow-md space-y-6">
              
              <div className="flex justify-between items-end border-b pb-4">
                <div>
                  <span className="text-xs text-muted-foreground">Registration Fee</span>
                  <div className="text-2xl font-extrabold text-foreground">${program.price}</div>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                    program.spotsLeft <= 5 ? "bg-destructive/10 text-destructive" : "bg-emerald-500/10 text-emerald-600"
                  }`}>
                    {program.spotsLeft === 0 ? "Fully Booked" : `${program.spotsLeft} spots left`}
                  </span>
                </div>
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
                    <div>{program.maxSpots} seats cap ({program.spotsLeft} available)</div>
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
                <Button 
                  className="w-full rounded-xl py-6 text-sm font-semibold shadow-md shadow-primary/10"
                  disabled={program.spotsLeft === 0}
                  onClick={handleBookClick}
                >
                  {program.spotsLeft === 0 ? "Registration Closed" : "Book Spot Now"}
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
              </div>

              {/* Trust badges */}
              <div className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground pt-2 text-center">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                <span>100% Secure Checkout & Refund Guarantee</span>
              </div>

            </div>
          </div>

        </div>

      </div>

      {/* CHECKOUT MODAL DIALOG */}
      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <DialogTitle>Register for Workshop</DialogTitle>
            <DialogDescription>
              Complete registration for: <span className="font-bold text-foreground">{program.title}</span>
            </DialogDescription>
          </DialogHeader>

          {paymentSuccess ? (
            /* PAYMENT SUCCESS SCREEN */
            <div className="py-6 text-center space-y-4">
              <div className="mx-auto w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-foreground">Payment Successful!</h3>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                  Your ticket has been confirmed. You can access the meeting details on your bookings dashboard.
                </p>
              </div>
              
              <div className="bg-muted/50 p-4 rounded-xl text-left border text-xs space-y-2 max-w-sm mx-auto">
                <div className="flex justify-between"><span className="text-muted-foreground">Class:</span> <span className="font-semibold text-foreground line-clamp-1">{program.title}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Seats:</span> <span className="font-semibold text-foreground">{spotsCount} Spot(s)</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Amount Paid:</span> <span className="font-bold text-foreground">${program.price * spotsCount}</span></div>
              </div>

              <div className="pt-4 flex gap-2">
                <Button variant="outline" className="w-full text-xs rounded-xl" onClick={() => {
                  setCheckoutOpen(false);
                  setPaymentSuccess(false);
                }}>
                  Close
                </Button>
                <Button className="w-full text-xs rounded-xl" onClick={() => {
                  setCheckoutOpen(false);
                  router.push("/bookings");
                }}>
                  Go to My Bookings
                </Button>
              </div>
            </div>
          ) : (
            /* PAYMENT CHECKOUT FORM */
            <form onSubmit={handleSubmit(onCheckoutSubmit)} className="space-y-4 pt-2">
              
              {/* Ticket Spot Count selector */}
              <div className="flex items-center justify-between bg-muted/30 p-3 rounded-xl border">
                <div className="flex items-center space-x-2.5">
                  <Ticket className="h-5 w-5 text-primary" />
                  <div className="text-xs">
                    <div className="font-bold text-foreground">Select Spots</div>
                    <div className="text-muted-foreground">${program.price} per ticket</div>
                  </div>
                </div>
                
                {/* Spot counter controls */}
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => setSpotsCount(prev => Math.max(1, prev - 1))}
                    className="w-7 h-7 bg-card rounded-md border flex items-center justify-center font-bold text-sm text-foreground active:scale-95 transition-transform"
                    disabled={spotsCount === 1}
                  >
                    -
                  </button>
                  <span className="font-bold text-sm text-foreground w-4 text-center">{spotsCount}</span>
                  <button
                    type="button"
                    onClick={() => setSpotsCount(prev => Math.min(program.spotsLeft, prev + 1))}
                    className="w-7 h-7 bg-card rounded-md border flex items-center justify-center font-bold text-sm text-foreground active:scale-95 transition-transform"
                    disabled={spotsCount === program.spotsLeft}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Subtotal calculation */}
              <div className="flex justify-between items-center text-xs font-semibold px-1">
                <span className="text-muted-foreground">Subtotal ({spotsCount} tickets)</span>
                <span className="text-foreground text-sm font-extrabold">${program.price * spotsCount}</span>
              </div>

              <div className="h-[1px] bg-border/40" />

              <div className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="cardholderName" className="text-xs">Cardholder Name</Label>
                  <Input
                    id="cardholderName"
                    placeholder="John Doe"
                    className="h-9 text-xs"
                    {...register("cardholderName")}
                    disabled={paymentLoading}
                  />
                  {errors.cardholderName && <p className="text-[10px] text-destructive">{errors.cardholderName.message}</p>}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="cardNumber" className="text-xs">Card Number</Label>
                  <div className="relative">
                    <CreditCard className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="cardNumber"
                      placeholder="4111 2222 3333 4444"
                      className="pl-9 h-9 text-xs"
                      maxLength={16}
                      {...register("cardNumber")}
                      disabled={paymentLoading}
                    />
                  </div>
                  {errors.cardNumber && <p className="text-[10px] text-destructive">{errors.cardNumber.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="expiryDate" className="text-xs">Expiry Date</Label>
                    <Input
                      id="expiryDate"
                      placeholder="MM/YY"
                      className="h-9 text-xs"
                      maxLength={5}
                      {...register("expiryDate")}
                      disabled={paymentLoading}
                    />
                    {errors.expiryDate && <p className="text-[10px] text-destructive">{errors.expiryDate.message}</p>}
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="cvv" className="text-xs">CVV Code</Label>
                    <Input
                      id="cvv"
                      placeholder="123"
                      type="password"
                      className="h-9 text-xs"
                      maxLength={3}
                      {...register("cvv")}
                      disabled={paymentLoading}
                    />
                    {errors.cvv && <p className="text-[10px] text-destructive">{errors.cvv.message}</p>}
                  </div>
                </div>
              </div>

              <DialogFooter className="pt-2">
                <Button variant="outline" type="button" className="text-xs h-9 rounded-lg" onClick={() => setCheckoutOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="text-xs h-9 rounded-lg px-6" disabled={paymentLoading}>
                  {paymentLoading ? (
                    <>
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Authorizing...
                    </>
                  ) : (
                    `Pay $${program.price * spotsCount}`
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}

        </DialogContent>
      </Dialog>

    </main>
  );
}
