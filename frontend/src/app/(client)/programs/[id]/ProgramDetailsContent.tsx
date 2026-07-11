"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  Star, Clock, MapPin, Calendar, Heart, Share2, ShieldCheck, 
  CheckCircle2, CreditCard, ChevronLeft, Ticket, Loader2, MessageSquare
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
import { useAuthStore } from "@/features/auth/store/authStore";
import { useClientStore } from "@/features/client/store/clientStore";
import { useAlertStore } from "@/features/alerts/store/alertStore";

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
}

export default function ProgramDetailsContent({ programId }: ProgramDetailsProps) {
  const router = useRouter();
  const showAlert = useAlertStore((s) => s.showAlert);
  const { isAuthenticated } = useAuthStore();
  const {
    wishlist,
    reviews,
    addToWishlist,
    removeFromWishlist,
    checkoutBooking,
    confirmPayment,
    fetchReviews,
    fetchEventDetails,
    fetchWishlist
  } = useClientStore();

  const [event, setEvent] = useState<any>(null);
  const [eventLoading, setEventLoading] = useState(true);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [spotsCount, setSpotsCount] = useState(1);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [confirmedBookingId, setConfirmedBookingId] = useState("");

  const {
    register,
    handleSubmit,
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

  useEffect(() => {
    async function loadData() {
      try {
        const details = await fetchEventDetails(programId);
        setEvent(details);
        await fetchReviews(programId);
        if (isAuthenticated) {
          await fetchWishlist();
        }
      } catch (err: any) {
        showAlert("Error Loading Event", err.message || "Failed to retrieve workshop details.", "destructive");
      } finally {
        setEventLoading(false);
      }
    }
    loadData();
  }, [programId, fetchEventDetails, fetchReviews, fetchWishlist, isAuthenticated]);

  if (eventLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <span className="text-xs text-muted-foreground mt-2">Loading workshop specs...</span>
      </div>
    );
  }

  if (!event) {
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

  const isWishlisted = wishlist.some((w) => w.eventId === event.id);
  const price = Number(event.venueDetails?.price || 0);
  const formattedDate = new Date(event.startTime).toLocaleDateString();
  const formattedTime = new Date(event.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const location = event.mode === "ONLINE" ? "Online Stream Room" : event.venueDetails?.address || "Physical Venue";
  const instructorName = event.host?.user ? `${event.host.user.firstName} ${event.host.user.lastName}` : "Platform Coach";

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
        await removeFromWishlist(event.id);
        showAlert("Removed from Wishlist", "Workshop removed from your saved list.", "info");
      } else {
        await addToWishlist(event.id);
        showAlert("Added to Wishlist", "Workshop added to your saved list.", "success");
      }
    } catch (err: any) {
      showAlert("Wishlist Error", err.message || "Failed to update wishlist.", "destructive");
    }
  };

  const onCheckoutSubmit = async (data: CheckoutFormValues) => {
    setPaymentLoading(true);
    try {
      // 1. Lock tickets & setup payment order
      const order = await checkoutBooking({
        eventId: event.id,
        seatCount: spotsCount
      });
      // 2. Directly confirm booking payment without gateway redirect
      const confirm = await confirmPayment(order.booking.id, {
        paymentMethod: "CARD"
      });
      if (confirm.success) {
        setConfirmedBookingId(order.booking.id);
        setPaymentSuccess(true);
        // Refresh event details
        const updated = await fetchEventDetails(programId);
        setEvent(updated);
      } else {
        showAlert("Payment Failed", "Ticket reservation payment failed. Check your card credentials.", "destructive");
      }
    } catch (err: any) {
      showAlert("Checkout Error", err.message || "Failed to complete ticket lock checkout.", "destructive");
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
    <main className="flex-1 py-8 bg-muted/10 dark:bg-card/5">
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
              <span className="inline-block text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full uppercase">
                {event.mode} CLASS
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight leading-tight">
                {event.title}
              </h1>
            </div>

            {/* Core Banner Image */}
            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-muted border">
              <img
                src={event.posterUrl || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=600"}
                alt={event.title}
                className="object-cover w-full h-full animate-in fade-in duration-300"
              />
            </div>

            {/* Syllabus Description */}
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">Workshop Details</h2>
              <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
                {event.description || "In this hands-on workshop, you will learn standard principles from verified coaches. Gain practical skill training and level up your skills."}
              </p>
            </div>

            {/* Highlighted Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
              <Card className="rounded-2xl border-border/40 bg-card overflow-hidden shadow-2xs">
                <CardContent className="p-5 flex items-center space-x-4">
                  <div className="bg-amber-500/10 text-amber-500 p-3.5 rounded-xl shrink-0">
                    <Star className="h-6 w-6 fill-amber-500 text-amber-500" />
                  </div>
                  <div>
                    <div className="text-2xl font-black text-foreground leading-none flex items-baseline space-x-1">
                      <span>4.8</span>
                      <span className="text-[10px] font-bold text-muted-foreground">/ 5.0</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground font-bold mt-1 uppercase tracking-wide">
                      {reviews.length} Verified Student Reviews
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-border/40 bg-card overflow-hidden shadow-2xs">
                <CardContent className="p-5 flex items-center space-x-4">
                  <div className="bg-primary/10 text-primary p-3.5 rounded-xl shrink-0">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Class Venue</div>
                    <div className="text-xs font-extrabold text-foreground mt-1 leading-snug break-words line-clamp-2" title={location}>
                      {location}
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
                  <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary shrink-0 ring-2 ring-primary/20">
                    {instructorName.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="space-y-2">
                    <div>
                      <h3 className="font-bold text-sm text-foreground">{instructorName}</h3>
                      <span className="text-[10px] text-muted-foreground">Certified Skill Coach</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {event.host?.bio || "An experienced educator dedicated to conducting practical skill workshops and delivering premium student learning resources."}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Separator />

            {/* Reviews list log */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-1.5">
                <MessageSquare className="h-5 w-5 text-primary" /> Verified Learner Reviews
              </h2>
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((rev) => (
                    <Card key={rev.id} className="rounded-xl border-border/30 bg-card">
                      <CardContent className="p-4 space-y-2.5">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            <div className="h-6 w-6 rounded-full bg-primary/15 flex items-center justify-center text-[10px] font-bold text-primary">
                              {rev.user ? `${rev.user.firstName[0]}${rev.user.lastName[0]}`.toUpperCase() : "SL"}
                            </div>
                            <span className="text-xs font-semibold text-foreground">
                              {rev.user ? `${rev.user.firstName} ${rev.user.lastName}` : "Student Learner"}
                            </span>
                          </div>
                          <div className="flex items-center space-x-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${i < rev.rating ? "fill-amber-400 text-amber-400" : "text-muted"}`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{rev.comment || "Great practical workshop! Learned a lot from the coach."}</p>
                        <span className="text-[9px] text-muted-foreground/60 block">{new Date(rev.createdAt).toLocaleDateString()}</span>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 border border-dashed rounded-xl text-xs text-muted-foreground bg-muted/10">
                  No student reviews posted for this workshop. Be the first to leave a feedback!
                </div>
              )}
            </div>

          </div>

          {/* Right Column (Ticket Registration Box) */}
          <div className="col-span-1">
            <div className="sticky top-24 bg-card border border-border/40 rounded-2xl p-6 shadow-md space-y-6">
              
              <div className="flex justify-between items-end border-b pb-4">
                <div>
                  <span className="text-xs text-muted-foreground">Registration Fee</span>
                  <div className="text-2xl font-extrabold text-foreground">${price}</div>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                    event.availableSeats <= 5 ? "bg-destructive/10 text-destructive" : "bg-emerald-500/10 text-emerald-600"
                  }`}>
                    {event.availableSeats === 0 ? "Fully Booked" : `${event.availableSeats} spots left`}
                  </span>
                </div>
              </div>

              {/* Booking Info Grid */}
              <div className="space-y-4 text-xs text-muted-foreground">
                <div className="flex items-center">
                  <Calendar className="h-4.5 w-4.5 text-primary mr-3 shrink-0" />
                  <div>
                    <div className="font-bold text-foreground">Date</div>
                    <div>{formattedDate}</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4.5 w-4.5 text-primary mr-3 shrink-0" />
                  <div>
                    <div className="font-bold text-foreground">Schedule Time</div>
                    <div>{formattedTime}</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <Ticket className="h-4.5 w-4.5 text-primary mr-3 shrink-0" />
                  <div>
                    <div className="font-bold text-foreground">Total Capacity</div>
                    <div>{event.totalSeats} seats cap ({event.availableSeats} available)</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4.5 w-4.5 text-primary mr-3 shrink-0" />
                  <div>
                    <div className="font-bold text-foreground">Location Venue</div>
                    <div className="text-foreground leading-relaxed break-words">{location}</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <Button 
                  className="w-full rounded-xl py-6 text-sm font-semibold shadow-md shadow-primary/10"
                  disabled={event.availableSeats === 0}
                  onClick={handleBookClick}
                >
                  {event.availableSeats === 0 ? "Registration Closed" : "Book Spot Now"}
                </Button>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" className="rounded-xl h-10 text-xs" onClick={handleWishlistToggle}>
                    <Heart className={`mr-1.5 h-4 w-4 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`} /> 
                    {isWishlisted ? "Saved" : "Save Workshop"}
                  </Button>
                  <Button variant="outline" className="rounded-xl h-10 text-xs" onClick={handleShareClick}>
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
              Complete registration for: <span className="font-bold text-foreground">{event.title}</span>
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
                <div className="flex justify-between"><span className="text-muted-foreground">Class:</span> <span className="font-semibold text-foreground line-clamp-1">{event.title}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Seats:</span> <span className="font-semibold text-foreground">{spotsCount} Spot(s)</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Amount Paid:</span> <span className="font-bold text-foreground">${price * spotsCount}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Booking ID:</span> <span className="font-mono text-muted-foreground">{confirmedBookingId.slice(0, 10)}</span></div>
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
                    <div className="text-muted-foreground">${price} per ticket</div>
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
                    onClick={() => setSpotsCount(prev => Math.min(event.availableSeats, prev + 1))}
                    className="w-7 h-7 bg-card rounded-md border flex items-center justify-center font-bold text-sm text-foreground active:scale-95 transition-transform"
                    disabled={spotsCount === event.availableSeats}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Subtotal calculation */}
              <div className="flex justify-between items-center text-xs font-semibold px-1">
                <span className="text-muted-foreground">Subtotal ({spotsCount} tickets)</span>
                <span className="text-foreground text-sm font-extrabold">${price * spotsCount}</span>
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
                    `Pay $${price * spotsCount}`
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
