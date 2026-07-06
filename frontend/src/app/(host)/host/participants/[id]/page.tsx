"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Users, Mail, CheckCircle2, MessageSquare,
  TicketCheck, Calendar, Clock, DollarSign, User, ShieldCheck, Tag
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MOCK_PROGRAMS, MOCK_BOOKINGS, Booking, Program } from "@/constants/mockData";
import { useAlertStore } from "@/features/alerts/store/alertStore";

interface StudentRosterItem {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  spots: number;
  paid: number;
  date: string;
  status: "confirmed" | "completed" | "cancelled" | "refunded";
}

export default function ParticipantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const programId = params.id as string;

  // Find the selected program
  const program = MOCK_PROGRAMS.find((p) => p.id === programId);

  // If program doesn't exist, show 404 fallback
  if (!program) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
        <h2 className="text-xl font-extrabold text-foreground">Program Not Found</h2>
        <p className="text-sm text-muted-foreground">The workshop you&apos;re looking for doesn&apos;t exist.</p>
        <Link href="/host/participants">
          <Button variant="outline" className="rounded-xl text-xs">
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back to Roster Board
          </Button>
        </Link>
      </div>
    );
  }

  // Find actual bookings matching this program
  const actualBookings = MOCK_BOOKINGS.filter(
    (b) => b.programId === program.id || b.programTitle === program.title
  );

  const students: StudentRosterItem[] = actualBookings.map((b) => {
    const isLiam = b.id.startsWith("bk_1");
    return {
      id: b.id,
      name: isLiam ? "Liam O'Connor" : "Sophia Martinez",
      email: isLiam ? "liam.oc@example.com" : "sophia.mt@example.com",
      avatarUrl: isLiam
        ? "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100"
        : "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100",
      spots: b.spotsBooked,
      paid: b.amountPaid,
      date: b.bookingDate,
      status: b.status,
    };
  });

  // Inject mock successful students if none exist in standard mocks for other approved programs
  if (students.length === 0 && program.status === "approved") {
    if (program.id === "prog_2") {
      students.push(
        {
          id: "mock_bk_2_1",
          name: "Emily Watson",
          email: "emily.w@example.com",
          avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=100",
          spots: 1,
          paid: program.price,
          date: "2026-06-30",
          status: "confirmed",
        },
        {
          id: "mock_bk_2_2",
          name: "Lucas Harper",
          email: "lucas.h@example.com",
          avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100",
          spots: 2,
          paid: program.price * 2,
          date: "2026-07-02",
          status: "confirmed",
        }
      );
    } else if (program.id === "prog_4") {
      students.push({
        id: "mock_bk_4_1",
        name: "Chloe Bennett",
        email: "chloe.b@example.com",
        avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100",
        spots: 1,
        paid: program.price,
        date: "2026-07-01",
        status: "confirmed",
      });
    }
  }

  // Filter to active successfully paid clients
  const activeStudents = students.filter(
    (s) => s.status === "confirmed" || s.status === "completed"
  );

  const enrolledSeats = activeStudents.reduce((sum, s) => sum + s.spots, 0);
  const showAlert = useAlertStore((s) => s.showAlert);

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
              Roster: {program.title}
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
              ${program.price} / Ticket
            </div>
          </div>
        </div>
      </Card>

      {/* Roster Area */}
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
                      <CheckCircle2 className="h-3.5 w-3.5" /> Paid (${student.paid})
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
    </div>
  );
}
