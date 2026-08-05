"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Mail, Phone, CheckCircle2, Search, Eye, FileText,
  TicketCheck, Calendar, Clock, User, ShieldCheck, Loader2, AlertTriangle
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useHostStore } from "@/features/host/store/hostStore";
import { useAlertStore } from "@/features/alerts/store/alertStore";
import { PaginationControl } from "@/components/ui/pagination-control";
import ParticipantDetailsModal from "../_components/ParticipantDetailsModal";

interface StudentRosterItem {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl: string;
  spots: number;
  paid: number;
  date: string;
  status: "confirmed" | "completed" | "canceled" | "refunded" | "initiated";
  participants?: any[];
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

  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

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
      phone: b.client.phone || undefined,
      avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100",
      spots: b.seatCount,
      paid: Number(b.totalAmount),
      date: new Date(b.createdAt).toLocaleDateString(),
      status: b.status.toLowerCase() as any,
      participants: b.participants || [],
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

  const filteredActiveStudents = activeStudents.filter((s) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q);
  });

  const enrolledSeats = activeStudents.reduce((sum, s) => sum + s.spots, 0);

  // Pagination for active students table
  const totalStudents = filteredActiveStudents.length;
  const totalPages = Math.ceil(totalStudents / limit) || 1;
  const paginatedActiveStudents = filteredActiveStudents.slice((page - 1) * limit, page * limit);

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

      {/* Participants Table View Container */}
      <Card className="border-border/40 bg-card rounded-2xl shadow-xs overflow-hidden">
        <CardHeader className="pb-3 border-b border-black/5 dark:border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-500" /> Payment Verified Participants ({activeStudents.length})
            </CardTitle>
            <CardDescription className="text-xs">
              Roster of enrolled students with confirmed ticket payments for this workshop.
            </CardDescription>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search participant name, email..."
              className="pl-9 h-9 rounded-xl text-xs bg-muted/20"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            />
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-black/5 dark:border-white/5 bg-muted/20 font-semibold text-muted-foreground">
                  <th className="py-3 px-4">Participant Student</th>
                  <th className="py-3 px-4">Enrollment Date & Spots</th>
                  <th className="py-3 px-4">Payment & Ticket</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-muted-foreground">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
                      Retrieving participant roster...
                    </td>
                  </tr>
                ) : paginatedActiveStudents.length > 0 ? (
                  paginatedActiveStudents.map((student) => (
                    <tr key={student.id} className="border-b border-black/5 dark:border-white/5 hover:bg-muted/10 last:border-none">
                      
                      {/* Participant Student */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={student.avatarUrl}
                            alt={student.name}
                            className="h-9 w-9 rounded-full object-cover border border-border/20 shadow-2xs shrink-0"
                          />
                          <div className="flex flex-col">
                            <span className="font-bold text-foreground">{student.name}</span>
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                              <Mail className="h-3 w-3 text-muted-foreground" /> {student.email}
                            </span>
                            {student.phone && (
                              <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-mono">
                                <Phone className="h-3 w-3 text-muted-foreground" /> {student.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Enrollment Date & Spots */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" /> {student.date}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {student.spots} ticket{student.spots > 1 ? "s" : ""} booked
                          </span>
                        </div>
                      </td>

                      {/* Payment & Ticket */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col">
                          <span className="font-black text-emerald-600 dark:text-[#a0f212] text-xs font-mono">
                            ₹{student.paid} INR
                          </span>
                          <span className="text-[9px] text-muted-foreground uppercase font-bold">
                            Ticket #{student.id.slice(0, 8)}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                          <CheckCircle2 className="h-3 w-3" /> PAID CONFIRMED
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-2.5 text-xs font-semibold rounded-xl"
                            title="View Full Participant Details"
                            onClick={() => {
                              setSelectedStudent(student);
                              setIsDetailsOpen(true);
                            }}
                          >
                            <Eye className="h-3.5 w-3.5 mr-1 text-primary" /> Show Details
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-2.5 text-xs font-semibold rounded-xl border-primary/20 text-primary hover:bg-primary/5"
                            title="Verify Check-in Ticket"
                            onClick={() => handleVerifyTicket(student.id)}
                          >
                            <TicketCheck className="h-3.5 w-3.5 mr-1" /> Verify Check-in
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-muted-foreground text-xs">
                      <User className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
                      <p className="font-bold text-sm">No active participants match query.</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Try searching with a different student name or email.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Control */}
          {totalStudents > 0 && (
            <PaginationControl
              currentPage={page}
              totalPages={totalPages}
              totalItems={totalStudents}
              limit={limit}
              onPageChange={(p) => setPage(p)}
              onLimitChange={(l) => { setLimit(l); setPage(1); }}
            />
          )}
        </CardContent>
      </Card>

      {/* Cancelled / Refunded Registrations */}
      {(() => {
        const cancelledStudents = students.filter(
          (s) => s.status === "canceled" || s.status === "refunded"
        );
        return (
          <div className="space-y-4 pt-4">
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
              <div className="flex flex-col items-center justify-center py-8 bg-card rounded-2xl border border-border/40 text-center space-y-1">
                <span className="text-xs text-muted-foreground italic">No cancelled bookings for this workshop.</span>
              </div>
            )}
          </div>
        );
      })()}

      {/* PARTICIPANT FULL DETAILS MODAL */}
      <ParticipantDetailsModal
        isOpen={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        selectedStudent={selectedStudent}
        program={program}
        onVerifyTicket={handleVerifyTicket}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedStudent(null);
        }}
      />
    </div>
  );
}
