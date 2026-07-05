"use client";

import React, { useState } from "react";
import { Users, Mail, CheckCircle2, Search, MessageSquare, TicketCheck } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MOCK_BOOKINGS, Booking } from "@/constants/mockData";

export default function HostParticipantsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Custom mock database roster mapping detailed student names
  const studentRoster = MOCK_BOOKINGS.map((bk) => {
    // Generate unique student details matching booking ids
    const isFirst = bk.id.startsWith("bk_1");
    return {
      id: bk.id,
      name: isFirst ? "Liam O'Connor" : "Sophia Martinez",
      email: isFirst ? "liam.oc@example.com" : "sophia.mt@example.com",
      programTitle: bk.programTitle,
      spots: bk.spotsBooked,
      paid: bk.amountPaid,
      date: bk.bookingDate,
      status: bk.status,
    };
  });

  const filteredRoster = studentRoster.filter((student) => {
    return (
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.programTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleVerifyTicket = (bookingId: string) => {
    alert(`Roster ticket successfully verified for check-in: CONFIRM_${bookingId}`);
  };

  const handleMessageStudent = (studentName: string) => {
    alert(`Messaging client portal opened for ${studentName}. Write your announcement below...`);
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="space-y-1 pb-4 border-b">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" /> Roster Board
        </h1>
        <p className="text-sm text-muted-foreground">Manage learner signups, check verification status, and communicate with students.</p>
      </div>

      {/* Filters & Actions */}
      <div className="flex max-w-md relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search student, class title, or email..."
          className="pl-9 h-10 rounded-xl"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Roster Table Card */}
      <Card className="border-border/40 rounded-2xl bg-card overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold">Roster Roster Grid</CardTitle>
          <CardDescription className="text-xs">Roster logs of registered students in active workshops.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-t">
              <thead>
                <tr className="border-b bg-muted/40 font-semibold text-muted-foreground">
                  <th className="py-3.5 px-4">Learner</th>
                  <th className="py-3.5 px-4">Class</th>
                  <th className="py-3.5 px-4">Spots Reserved</th>
                  <th className="py-3.5 px-4">Earnings Received</th>
                  <th className="py-3.5 px-4">Booking Date</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRoster.length > 0 ? (
                  filteredRoster.map((student) => (
                    <tr key={student.id} className="border-b hover:bg-muted/30">
                      <td className="py-4 px-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-foreground">{student.name}</span>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Mail className="h-3 w-3" /> {student.email}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-medium text-foreground truncate max-w-[200px]">{student.programTitle}</td>
                      <td className="py-4 px-4 font-semibold text-foreground text-center">{student.spots} ticket(s)</td>
                      <td className="py-4 px-4 font-bold text-foreground">${student.paid}</td>
                      <td className="py-4 px-4 text-muted-foreground">{student.date}</td>
                      <td className="py-4 px-4 text-center">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md uppercase ${
                          student.status === "confirmed" || student.status === "completed"
                            ? "bg-emerald-500/10 text-emerald-600"
                            : "bg-destructive/10 text-destructive"
                        }`}>
                          {student.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8 rounded-lg" 
                            title="Message Learner"
                            onClick={() => handleMessageStudent(student.name)}
                          >
                            <MessageSquare className="h-3.5 w-3.5" />
                          </Button>
                          {student.status === "confirmed" && (
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-8 w-8 rounded-lg border-primary/20 text-primary hover:bg-primary/5 hover:text-primary" 
                              title="Verify Ticket Check-in"
                              onClick={() => handleVerifyTicket(student.id)}
                            >
                              <TicketCheck className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-muted-foreground text-xs">
                      No matching participants registered on the roster.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
