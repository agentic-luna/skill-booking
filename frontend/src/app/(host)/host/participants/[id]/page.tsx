"use client";

import React, { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Mail, CheckCircle2, MessageSquare,
  TicketCheck, Calendar, Clock, User, ShieldCheck, Loader2, AlertTriangle
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useHostStore } from "@/features/host/store/hostStore";
import { useAlertStore } from "@/features/alerts/store/alertStore";

interface StudentRosterItem {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  spots: number;
  paid: number;
  date: string;
  status: "confirmed" | "completed" | "canceled" | "refunded" | "initiated";
  refundRequest?: {
    reason: string | null;
    status: "PENDING" | "APPROVED" | "DECLINED";
    refundAmount: number;
    refundPercentage: number;
  } | null;
}

export default function ParticipantDetailPage() {
  const params = useParams();
  const programId = params.id as string;

  const showAlert = useAlertStore((s) => s.showAlert);
  const { myEvents, eventBookings, fetchMyEvents, fetchEventBookings, isLoading } = useHostStore();

  useEffect(() => {
    fetchMyEvents();
    fetchEventBookings(programId);
  }, [programId, fetchMyEvents, fetchEventBookings]);

  const programObj = myEvents.find((p) => p.id === programId);
  const bookingsForEvent = eventBookings[programId] || [];

  if (isLoading && !programObj) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="text-xs text-muted-foreground mt-2">Loading event participants...</span>
      </div>
    );
  }

  // If program doesn't exist, show fallback
  if (!programObj) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
        <h2 className="text-xl font-extrabold text-foreground">Program Not Found</h2>
        <p className="text-sm text-muted-foreground">The workshop you&apos;re looking for doesn&apos;t exist.</p>
        <Link href="/host/participants">
          <Button variant="outline" className="rounded-xl text-xs">
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back to Participants List
          </Button>
        </Link>
      </div>
    );
  }

  const program = {
    id: programObj.id,
    title: programObj.title,
    imageUrl: programObj.posterUrl || "https://images.unsplash.com/photo-1618401471353-b98aedd07871?auto=format&fit=crop&q=80&w=600",
    status: programObj.status.toLowerCase(),
    category: programObj.mode,
    date: new Date(programObj.startTime).toLocaleDateString(),
    time: new Date(programObj.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    maxSpots: programObj.totalSeats,
    price: 500,
  };

  const students: StudentRosterItem[] = bookingsForEvent.map((b: any) => {
    return {
      id: b.id,
      name: `${b.client.firstName} ${b.client.lastName}`,
      email: b.client.email,
      avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100",
      spots: b.seatCount,
      paid: Number(b.totalAmount),
      date: new Date(b.createdAt).toLocaleDateString(),
      status: b.status.toLowerCase() as any,
      refundRequest: b.refundRequest ? {
        reason: b.refundRequest.reason,
        status: b.refundRequest.status,
        refundAmount: Number(b.refundRequest.refundAmount),
        refundPercentage: Number(b.refundRequest.refundPercentage),
      } : null
    };
  });

  // Filter to active successfully paid clients
  const activeStudents = students.filter(
    (s) => s.status === "confirmed" || s.status === "completed"
  );

  const enrolledSeats = activeStudents.reduce((sum, s) => sum + s.spots, 0);

  const handleVerifyTicket = (bookingId: string) => {
    showAlert("Ticket Verified", `Check-in ticket successfully verified for check-in: CONFIRM_${bookingId}`, "success");
  };

  const handleMessageStudent = (studentName: string) => {
    showAlert("Chat Console", `Chat console opened for communications with: ${studentName}`, "info");
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-border/40">
        <div className="flex items-center space-x-4">
          <Link href="/host/participants">
            <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl shrink-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
              Participants: {program.title}
              {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            </h1>
            <p className="text-sm text-muted-foreground">
              Review and manage participants enrolled in this workshop.
            </p>
          </div>
        </div>
      </div>

      {/* Program Summary Card */}
      <Card className="border-border/40 bg-card overflow-hidden rounded-2xl shadow-xs">
        <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-br from-primary/5 via-transparent to-violet-500/5">
          <div className="flex items-center space-x-4">
            <img
              src={program.imageUrl}
              alt={program.title}
              className="w-24 h-16 object-cover rounded-xl shrink-0 border border-border/10 shadow-sm"
            />
            <div className="space-y-1.5">
              <div className="flex items-center space-x-2">
                <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-muted-foreground/10 text-muted-foreground uppercase tracking-wider">
                  {program.category}
                </span>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  {program.status}
                </span>
              </div>
              <h3 className="font-bold text-base text-foreground leading-tight">{program.title}</h3>
              <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                <span className="flex items-center">
                  <Calendar className="h-3.5 w-3.5 mr-1" /> {program.date}
                </span>
                <span className="flex items-center">
                  <Clock className="h-3.5 w-3.5 mr-1" /> {program.time}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 border-t md:border-none pt-4 md:pt-0">
            <div className="text-right">
              <div className="text-xs text-muted-foreground font-semibold">Total Enrollment</div>
              <div className="text-lg font-extrabold text-foreground">
                {enrolledSeats} / {program.maxSpots} Seats Filled
              </div>
            </div>
            <div className="text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-xl border border-primary/15">
              {program.price} INR / Ticket
            </div>
          </div>
        </div>
      </Card>

      {/* Participants Area */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 text-sm font-bold text-muted-foreground uppercase tracking-wide">
          <ShieldCheck className="h-5 w-5 text-emerald-500" />
          <span>Payment Verified Participants ({activeStudents.length})</span>
        </div>

        {activeStudents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {activeStudents.map((student) => (
              <Card
                key={student.id}
                className="border-border/40 bg-card overflow-hidden rounded-xl shadow-xs hover:border-primary/20 transition-all duration-300 flex items-center justify-between p-5"
              >
                <div className="flex items-center space-x-4 min-w-0">
                  <img
                    src={student.avatarUrl}
                    alt={student.name}
                    className="h-12 w-12 rounded-full object-cover border border-border/20 shadow-xs"
                  />
                  <div className="min-w-0 space-y-1">
                    <h4 className="font-bold text-sm text-foreground truncate">{student.name}</h4>
                    <span className="text-xs text-muted-foreground block truncate flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5" /> {student.email}
                    </span>
                    <span className="text-[10px] text-muted-foreground block">
                      Enrolled: {student.date} • {student.spots} ticket{student.spots > 1 ? "s" : ""}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end space-y-3 shrink-0">
                  <div>
                    <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-lg uppercase inline-flex items-center gap-1 border border-emerald-500/15 shadow-2xs">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Paid ({student.paid} INR)
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-lg"
                      title="Contact Student"
                      onClick={() => handleMessageStudent(student.name)}
                    >
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-lg border-primary/20 text-primary hover:bg-primary/5"
                      title="Verify Ticket Check-in"
                      onClick={() => handleVerifyTicket(student.id)}
                    >
                      <TicketCheck className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-card rounded-2xl border border-border/40 text-center space-y-3">
            <div className="bg-muted/50 p-4 rounded-full">
              <User className="h-8 w-8 text-muted-foreground opacity-40" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-foreground">No Registered Participants</h3>
              <p className="text-xs text-muted-foreground max-w-sm">
                No active learner registrations have successfully checked out yet.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Cancelled / Refunded Registrations */}
      {(() => {
        const cancelledStudents = students.filter(
          (s) => s.status === "canceled" || s.status === "refunded"
        );
        return (
          <div className="space-y-4 pt-6 border-t border-border/30">
            <div className="flex items-center space-x-2 text-sm font-bold text-muted-foreground uppercase tracking-wide">
              <AlertTriangle className="h-4.5 w-4.5 text-destructive" />
              <span>Cancelled & Refunded Registrations ({cancelledStudents.length})</span>
            </div>

            {cancelledStudents.length > 0 ? (
              <div className="overflow-hidden rounded-2xl border border-border/30 bg-card shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-muted/40 border-b border-border/30 font-bold text-muted-foreground">
                        <th className="p-4">Participant</th>
                        <th className="p-4">Tickets</th>
                        <th className="p-4">Paid Amount</th>
                        <th className="p-4">Cancellation Reason</th>
                        <th className="p-4">Refund Estimation</th>
                        <th className="p-4">Refund Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/20">
                      {cancelledStudents.map((student) => {
                        const req = student.refundRequest;
                        return (
                          <tr key={student.id} className="hover:bg-muted/15 transition-colors">
                            <td className="p-4">
                              <div className="font-bold text-foreground">{student.name}</div>
                              <div className="text-[10px] text-muted-foreground">{student.email}</div>
                            </td>
                            <td className="p-4 font-semibold text-muted-foreground">
                              {student.spots} spot{student.spots > 1 ? "s" : ""}
                            </td>
                            <td className="p-4 font-bold text-foreground font-mono">
                              ₹{student.paid}
                            </td>
                            <td className="p-4 text-muted-foreground italic max-w-[200px] truncate" title={req?.reason || "No reason provided"}>
                              "{req?.reason || "No reason provided"}"
                            </td>
                            <td className="p-4">
                              {req ? (
                                <div className="space-y-0.5">
                                  <span className="font-bold text-foreground font-mono">₹{req.refundAmount.toFixed(2)}</span>
                                  <span className="text-[10px] text-muted-foreground block">({req.refundPercentage}% refund)</span>
                                </div>
                              ) : (
                                <span className="text-muted-foreground italic">No refund requested</span>
                              )}
                            </td>
                            <td className="p-4">
                              {req ? (
                                (() => {
                                  let badgeStyle = "bg-amber-500/10 text-amber-700 border-amber-500/25";
                                  if (req.status === "APPROVED") {
                                    badgeStyle = "bg-emerald-500/10 text-emerald-700 border-emerald-500/25";
                                  } else if (req.status === "DECLINED") {
                                    badgeStyle = "bg-rose-500/10 text-rose-700 border-rose-500/25";
                                  }
                                  return (
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${badgeStyle}`}>
                                      {req.status === "PENDING" ? "Pending Admin Approval" : req.status}
                                    </span>
                                  );
                                })()
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full border border-border bg-muted/20 text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
                                  Cancelled
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 bg-card rounded-2xl border border-border/40 text-center space-y-2">
                <span className="text-xs text-muted-foreground italic">No cancelled bookings for this workshop.</span>
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}
