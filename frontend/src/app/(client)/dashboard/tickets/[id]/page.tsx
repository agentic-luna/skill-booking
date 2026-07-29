"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import {
  BookmarkCheck, Calendar, Clock, MapPin, Wifi, CheckCircle2,
  FileText, Ticket, HelpCircle, MessageSquare, AlertCircle,
  ChevronRight, ShieldAlert, ArrowLeft, RefreshCw, Send, Sparkles, Timer, PlayCircle, ShieldCheck
} from "lucide-react";

import BackButton from "@/components/common/BackButton";
import Footer from "@/components/common/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuthStore } from "@/features/auth/store/authStore";
import { useClientStore } from "@/features/client/store/clientStore";
import { useAlertStore } from "@/features/alerts/store/alertStore";
import { API_BASE_URL } from "@/lib/config";
import type { ClientBooking } from "@/features/client/api/types";

export default function SingleBookingDetailPage() {
  const router = useRouter();
  const routeParams = useParams();
  const bookingId = routeParams?.id as string;

  const { isAuthenticated, user } = useAuthStore();
  const { bookings, fetchBookings, cancelBooking } = useClientStore();
  const showAlert = useAlertStore((s) => s.showAlert);

  const [booking, setBooking] = useState<ClientBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [submittingComplaint, setSubmittingComplaint] = useState(false);

  // Help & Complaint Form state
  const [category, setCategory] = useState("Ticket & Access Issue");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [showComplaintForm, setShowComplaintForm] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    loadData();
  }, [isAuthenticated, bookingId]);

  const loadData = async () => {
    setLoading(true);
    await fetchBookings();
  };

  useEffect(() => {
    if (bookings.length > 0) {
      const found = bookings.find((b) => b.id === bookingId);
      if (found) {
        setBooking(found);
      }
    }
    setLoading(false);
  }, [bookings, bookingId]);

  const handleComplaintSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      showAlert("Missing Fields", "Please provide both subject and detailed description.", "warning");
      return;
    }

    setSubmittingComplaint(true);
    try {
      const token = localStorage.getItem("bms_access_token");
      const hostUser = booking?.event?.host?.user;
      const hostName = booking?.event?.trainerName || (hostUser ? `${hostUser.firstName} ${hostUser.lastName}` : "Platform Host");

      const res = await fetch(`${API_BASE_URL}/complaints`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          subject,
          description,
          category,
          bookingId: booking?.id,
          hostId: booking?.event?.host?.id,
          hostName,
          clientId: user?.id,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showAlert("Complaint Logged", "Your support ticket has been submitted to admin. Our team will review it shortly.", "success");
        setSubject("");
        setDescription("");
        setShowComplaintForm(false);
      } else {
        showAlert("Error", data.error || "Failed to log complaint.", "destructive");
      }
    } catch (err: any) {
      showAlert("Error", err.message || "Network error submitting complaint.", "destructive");
    } finally {
      setSubmittingComplaint(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
        <p className="mt-4 text-sm text-muted-foreground">Loading booking details...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md">
          <ShieldAlert className="h-12 w-12 text-amber-500 mx-auto" />
          <h2 className="text-xl font-bold">Booking Not Found</h2>
          <p className="text-sm text-muted-foreground">We couldn't find the details for booking ID #{bookingId.slice(0, 8)}.</p>
          <Button onClick={() => router.push("/dashboard/tickets")} variant="default">
            Return to My Bookings
          </Button>
        </div>
      </div>
    );
  }

  const event = booking.event;
  const startTime = event ? new Date(event.startTime) : new Date();
  const formattedDate = startTime.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const formattedTime = startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const isOnline = event?.mode === "ONLINE";
  const location = isOnline ? "Online Live Stream" : (event?.venueDetails as any)?.address || "Physical Venue";
  const hostUser = event?.host?.user;
  const instructorName = hostUser ? `${hostUser.firstName} ${hostUser.lastName}` : "Verified Host";

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs font-bold rounded-full flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5"/> Confirmed</span>;
      case "COMPLETED":
        return <span className="px-3 py-1 bg-blue-500/10 text-blue-600 border border-blue-500/20 text-xs font-bold rounded-full flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5"/> Completed</span>;
      case "PENDING":
      case "INITIATED":
        return <span className="px-3 py-1 bg-amber-500/10 text-amber-600 border border-amber-500/20 text-xs font-bold rounded-full flex items-center gap-1.5"><Timer className="h-3.5 w-3.5"/> Pending</span>;
      default:
        return <span className="px-3 py-1 bg-rose-500/10 text-rose-600 border border-rose-500/20 text-xs font-bold rounded-full flex items-center gap-1.5"><AlertCircle className="h-3.5 w-3.5"/> {status}</span>;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-muted/10">
      <main className="flex-1 pt-[100px] pb-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-6">

          {/* Top Breadcrumb & Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <BackButton href="/dashboard/tickets" label="Back to My Tickets" />
            <div className="flex items-center gap-2">
              {/* Invoice Download */}
              <Button
                variant="outline"
                size="sm"
                className="h-9 text-xs rounded-xl"
                onClick={async () => {
                  try {
                    const token = localStorage.getItem("bms_access_token");
                    const { getInvoiceUrl } = await import("@/features/client/api/client.api");
                    const invoiceUrl = getInvoiceUrl(booking.id);
                    const res = await fetch(invoiceUrl, {
                      headers: token ? { Authorization: `Bearer ${token}` } : {},
                    });
                    if (!res.ok) throw new Error("Failed to generate PDF invoice");
                    const blob = await res.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `invoice_${booking.id.slice(0, 8).toUpperCase()}.pdf`;
                    a.click();
                    showAlert("Invoice Downloaded", "Your PDF invoice has been saved.", "success");
                  } catch (err: any) {
                    showAlert("Download Failed", err.message || "Failed to download invoice.", "destructive");
                  }
                }}
              >
                <FileText className="h-4 w-4 mr-1.5 text-blue-600" /> Invoice
              </Button>

              {/* PDF Ticket */}
              {(booking.status === "CONFIRMED" || booking.status === "COMPLETED") && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 text-xs rounded-xl border-primary/30 text-primary hover:bg-primary/5 font-semibold"
                  onClick={async () => {
                    try {
                      const token = localStorage.getItem("bms_access_token");
                      const { getTicketUrl } = await import("@/features/client/api/client.api");
                      const ticketUrl = `${getTicketUrl(booking.id)}?format=pdf`;
                      const res = await fetch(ticketUrl, {
                        headers: token ? { Authorization: `Bearer ${token}` } : {},
                      });
                      if (!res.ok) throw new Error("Failed to generate PDF ticket");
                      const blob = await res.blob();
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `ticket_${booking.id.slice(0, 8).toUpperCase()}.pdf`;
                      a.click();
                      showAlert("PDF Ticket Downloaded", "Your admission ticket PDF has been downloaded.", "success");
                    } catch (err: any) {
                      showAlert("Download Failed", err.message || "Failed to download ticket.", "destructive");
                    }
                  }}
                >
                  <FileText className="h-4 w-4 mr-1.5" /> Booking Pass (PDF)
                </Button>
              )}
            </div>
          </div>

          {/* Flipkart-inspired Order Header Card */}
          <Card className="p-6 rounded-2xl border-border/50 shadow-sm bg-card">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Booking ID</div>
                <div className="text-xl font-black text-foreground tracking-tight font-mono">
                  #{booking.bookingRef || booking.id.slice(0, 8).toUpperCase()}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {getStatusBadge(booking.status)}
                <span className="text-xs text-muted-foreground">
                  Booked on {new Date(booking.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </Card>

          {/* Main Grid: Event Details & Payment Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left Col: Workshop / Item details (2 cols) */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6 rounded-2xl border-border/50 shadow-sm bg-card space-y-4">
                <div className="flex flex-col sm:flex-row gap-5">
                  <img
                    src={event?.posterUrl || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=400"}
                    alt={event?.title || "Workshop"}
                    className="w-full sm:w-44 h-36 object-cover rounded-xl border border-border/40 shadow-xs"
                  />
                  <div className="flex-1 space-y-3">
                    <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-md uppercase tracking-wide ${
                      isOnline ? "bg-primary/10 text-primary" : "bg-muted text-foreground"
                    }`}>
                      {isOnline ? "Online Live Workshop" : "In-Person Session"}
                    </span>

                    <h2 className="text-xl font-bold text-foreground leading-tight">
                      {event?.title || "Skill Workshop"}
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground pt-1">
                      <span className="flex items-center font-medium text-foreground">
                        <Calendar className="h-4 w-4 mr-2 text-primary" /> {formattedDate}
                      </span>
                      <span className="flex items-center font-medium text-foreground">
                        <Clock className="h-4 w-4 mr-2 text-primary" /> {formattedTime}
                      </span>
                      <span className="flex items-center sm:col-span-2 text-muted-foreground">
                        {isOnline ? <Wifi className="h-4 w-4 mr-2 text-emerald-600" /> : <MapPin className="h-4 w-4 mr-2 text-rose-500" />}
                        {location}
                      </span>
                    </div>

                    <div className="text-xs text-muted-foreground pt-1">
                      Host Instructor: <span className="font-semibold text-foreground">{instructorName}</span>
                    </div>
                  </div>
                </div>

                {isOnline && booking.status === "CONFIRMED" && (
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300 font-medium">
                      <Sparkles className="h-4 w-4 text-emerald-600 shrink-0" />
                      Live Workshop Link will open 5 minutes prior to start time.
                    </div>
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg"
                      onClick={() => showAlert("Room Launch", "Launching live workshop stream...", "info")}
                    >
                      <PlayCircle className="h-4 w-4 mr-1.5" /> Launch Live Class
                    </Button>
                  </div>
                )}
              </Card>

              {/* Flipkart-inspired Help & Complaint Support Section */}
              <Card className="p-6 rounded-2xl border-border/50 shadow-sm bg-card space-y-6" id="help-section">
                <div className="flex items-center justify-between border-b border-border/40 pb-4">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-emerald-600" />
                    <div>
                      <h3 className="font-bold text-base text-foreground">Need Help & Support for this Booking?</h3>
                      <p className="text-xs text-muted-foreground">Log an issue or contact platform support directly regarding this ticket.</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => setShowComplaintForm(!showComplaintForm)}
                    size="sm"
                    variant="outline"
                    className="text-xs font-bold border-primary/40 text-primary hover:bg-primary/10"
                  >
                    {showComplaintForm ? "Close Form" : "Submit Complaint & Help Request"}
                  </Button>
                </div>

                {/* Complaint Form Modal / Inline Box */}
                {showComplaintForm && (
                  <form onSubmit={handleComplaintSubmit} className="p-4 bg-muted/20 rounded-xl border border-border/40 space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground">Issue Category</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary"
                      >
                        <option value="Booking & Access Issue">⚡ Booking & Access Issue</option>
                        <option value="Host Conduct & Quality">👨‍🏫 Host Conduct & Quality</option>
                        <option value="Payment & Refund Inquiry">💳 Payment & Refund Inquiry</option>
                        <option value="Technical & Stream Issue">💻 Technical & Stream Issue</option>
                        <option value="Other Complaint & Help">❓ Other Complaint & Help</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground">Subject / Short Title</label>
                      <input
                        type="text"
                        placeholder="e.g. Session link issue / Host missed start time"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground">Detailed Description</label>
                      <textarea
                        rows={4}
                        placeholder="Please describe the issue in detail so our help & support team can assist you..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary"
                        required
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-xs"
                        onClick={() => setShowComplaintForm(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        size="sm"
                        disabled={submittingComplaint}
                        className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
                      >
                        {submittingComplaint ? <RefreshCw className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <Send className="h-3.5 w-3.5 mr-1.5" />}
                        Submit Complaint & Help Request
                      </Button>
                    </div>
                  </form>
                )}
              </Card>
            </div>

            {/* Right Col: Price Breakdown & Payment Info */}
            <div className="space-y-6">
              <Card className="p-6 rounded-2xl border-border/50 shadow-sm bg-card space-y-4">
                <h3 className="font-bold text-base text-foreground border-b border-border/40 pb-3">
                  Payment Breakdown
                </h3>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Reserved Seats</span>
                    <span className="font-semibold text-foreground">{booking.seatCount} Seat(s)</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Base Seat Price</span>
                    <span className="font-semibold text-foreground">
                      ₹{Math.max(0, (Number(booking.totalAmount ?? booking.amountPaid) / (booking.seatCount || 1))).toFixed(2)} / seat
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Platform & Taxes</span>
                    <span className="font-semibold text-emerald-600">Included</span>
                  </div>
                  <div className="border-t border-border/40 pt-2 flex justify-between text-sm font-bold text-foreground">
                    <span>Total Paid</span>
                    <span className="text-primary text-base">₹{Number(booking.totalAmount ?? booking.amountPaid).toFixed(2)}</span>
                  </div>
                </div>

                <div className="p-3 bg-muted/20 rounded-xl text-xs space-y-1">
                  <div className="text-muted-foreground">Payment Status: <span className="font-bold text-emerald-600 uppercase">{booking.status}</span></div>
                  <div className="text-muted-foreground">Ref: <span className="font-mono text-foreground">{booking.bookingRef || booking.id.slice(0, 8).toUpperCase()}</span></div>
                </div>
              </Card>
            </div>

          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}
