"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  BookmarkCheck, Calendar, Clock, MapPin, PlayCircle, FileText, 
  Trash2, AlertTriangle, ArrowLeft 
} from "lucide-react";

import { useAuthStore } from "@/features/auth/store/authStore";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import AlertBox from "@/components/ui/alert-box";
import { useAlertStore } from "@/features/alerts/store/alertStore";
import { MOCK_BOOKINGS, Booking } from "@/constants/mockData";

export default function BookingsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [bookings, setBookings] = useState<Booking[]>(MOCK_BOOKINGS);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
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

  const [cancellingBookingId, setCancellingBookingId] = useState<string | null>(null);
  const showAlert = useAlertStore((s) => s.showAlert);

  const handleConfirmCancel = () => {
    if (!cancellingBookingId) return;

    setBookings((prev) =>
      prev.map((bk) =>
        bk.id === cancellingBookingId
          ? { ...bk, status: "cancelled" as const }
          : bk
      )
    );

    // Sync status change in master bookings database
    const idx = MOCK_BOOKINGS.findIndex((b) => b.id === cancellingBookingId);
    if (idx !== -1) {
      MOCK_BOOKINGS[idx] = {
        ...MOCK_BOOKINGS[idx],
        status: "cancelled" as const,
      };
    }

    setCancellingBookingId(null);
    showAlert(
      "Booking Cancelled",
      "Your reservation has been successfully cancelled. A 100% automatic refund has been initiated to your original payment method.",
      "success"
    );
  };

  const activeBookings = bookings.filter((b) => b.status === "confirmed");
  const pastBookings = bookings.filter((b) => ["completed", "cancelled", "refunded"].includes(b.status));

  const BookingCard = ({ booking }: { booking: Booking }) => (
    <Card className="overflow-hidden border-border/40 rounded-2xl shadow-xs bg-card">
      <div className="flex flex-col sm:flex-row">
        <div className="sm:w-48 aspect-video sm:aspect-auto bg-muted relative">
          <img
            src={booking.programImage}
            alt={booking.programTitle}
            className="object-cover w-full h-full"
          />
        </div>
        
        <div className="flex-1 p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex justify-between items-start gap-2">
              <h3 className="font-bold text-base text-foreground leading-tight">{booking.programTitle}</h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase shrink-0 ${
                booking.status === "confirmed" 
                  ? "bg-primary/10 text-primary" 
                  : booking.status === "completed"
                  ? "bg-emerald-500/10 text-emerald-600"
                  : "bg-destructive/10 text-destructive"
              }`}>
                {booking.status}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground pt-1">
              <span className="flex items-center"><Calendar className="h-3.5 w-3.5 mr-1.5" /> {booking.date}</span>
              <span className="flex items-center"><Clock className="h-3.5 w-3.5 mr-1.5" /> {booking.time}</span>
              <span className="flex items-center sm:col-span-2"><MapPin className="h-3.5 w-3.5 mr-1.5" /> {booking.location}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between border-t border-border/40 pt-4 gap-3">
            <div className="text-xs text-muted-foreground">
              Host: <span className="font-medium text-foreground">{booking.hostName}</span>
              <span className="mx-2">•</span>
              Paid: <span className="font-bold text-foreground">${booking.amountPaid}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 text-xs rounded-lg"
                onClick={() => showAlert("Receipt Downloaded", `Invoice successfully downloaded for transaction reference: TXN_${booking.id}`, "success")}
              >
                <FileText className="h-3.5 w-3.5 mr-1" /> Invoice
              </Button>

              {booking.status === "confirmed" ? (
                <>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="h-8 text-xs rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 hover:text-destructive border-transparent"
                    onClick={() => setCancellingBookingId(booking.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" /> Cancel
                  </Button>
                  <Button 
                    size="sm" 
                    className="h-8 text-xs rounded-lg"
                    onClick={() => showAlert("Room Launching", "Launching your live workshop room. Please allow your browser popup windows access.", "info")}
                  >
                    <PlayCircle className="h-3.5 w-3.5 mr-1" /> Launch Class
                  </Button>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 bg-muted/10 dark:bg-card/5 py-8">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-6">
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Link href="/home" className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground gap-1 pb-1 font-semibold">
                <ArrowLeft className="h-3 w-3" /> Back to feed
              </Link>
              <h1 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
                <BookmarkCheck className="h-6 w-6 text-primary" /> My Workshop Tickets
              </h1>
            </div>
          </div>

          <Tabs defaultValue="active" className="w-full">
            <TabsList className="grid grid-cols-2 max-w-xs mb-4">
              <TabsTrigger value="active">Active Tickets ({activeBookings.length})</TabsTrigger>
              <TabsTrigger value="past">Past / Cancelled</TabsTrigger>
            </TabsList>
            
            <TabsContent value="active" className="space-y-4">
              {activeBookings.length > 0 ? (
                activeBookings.map((bk) => <BookingCard key={bk.id} booking={bk} />)
              ) : (
                <div className="text-center p-12 border bg-card border-dashed border-border/60 rounded-2xl space-y-4">
                  <BookmarkCheck className="h-8 w-8 text-muted-foreground mx-auto" />
                  <div className="space-y-1">
                    <h3 className="font-bold text-base text-foreground">No active bookings</h3>
                    <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                      You haven&apos;t reserved spots for any upcoming workshops yet.
                    </p>
                  </div>
                  <Link href="/programs">
                    <Button className="rounded-xl text-xs h-9">Browse Skills</Button>
                  </Link>
                </div>
              )}
            </TabsContent>

            <TabsContent value="past" className="space-y-4">
              {pastBookings.length > 0 ? (
                pastBookings.map((bk) => <BookingCard key={bk.id} booking={bk} />)
              ) : (
                <div className="text-center p-12 bg-card border border-dashed rounded-2xl text-muted-foreground text-xs">
                  No booking history found.
                </div>
              )}
            </TabsContent>
          </Tabs>

        </div>
      </main>

      {/* CANCELLATION DIALOG MODAL */}
      <Dialog open={cancellingBookingId !== null} onOpenChange={() => setCancellingBookingId(null)}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <span>Cancel Reservation?</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Review cancellation parameters before finalizing.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to cancel this booking? This will remove your reservation, and you will receive a 100% automatic refund to your original payment method.
            </p>

            <AlertBox
              variant="warning"
              description="Cancellations are permanent. If you change your mind, you will need to re-book and pay for the ticket again (subject to seat availability)."
            />
          </div>

          <DialogFooter className="pt-2 gap-2 sm:gap-0">
            <Button
              variant="outline"
              type="button"
              className="text-xs h-9 rounded-xl"
              onClick={() => setCancellingBookingId(null)}
            >
              No, Keep Ticket
            </Button>
            <Button
              variant="destructive"
              className="text-xs h-9 rounded-xl font-semibold"
              onClick={handleConfirmCancel}
            >
              Yes, Cancel Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
