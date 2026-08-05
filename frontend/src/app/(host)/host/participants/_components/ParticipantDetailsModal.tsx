"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mail, Phone, Calendar, Clock, TicketCheck, CheckCircle2, User, Landmark, ShieldCheck, Copy, Check } from "lucide-react";

interface ParticipantDetailsModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedStudent: any | null;
  program: any | null;
  onVerifyTicket: (bookingId: string) => void;
  onClose: () => void;
}

export default function ParticipantDetailsModal({
  isOpen,
  onOpenChange,
  selectedStudent,
  program,
  onVerifyTicket,
  onClose,
}: ParticipantDetailsModalProps) {
  const [copied, setCopied] = useState(false);

  if (!selectedStudent || !program) return null;

  const copyTicketCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const ticketCode = `CONFIRM_${selectedStudent.id}`;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-base font-extrabold flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-500" /> Participant Enrollment Record
          </DialogTitle>
          <DialogDescription className="text-xs">
            Complete registration, payment, and ticket details for {selectedStudent.name}.
          </DialogDescription>
        </DialogHeader>

        <div className="py-2 space-y-4 text-xs">
          
          {/* Student Profile Header */}
          <div className="bg-card border border-black/5 dark:border-white/5 p-4 rounded-xl flex items-center space-x-4">
            <img
              src={selectedStudent.avatarUrl}
              alt={selectedStudent.name}
              className="h-14 w-14 rounded-full object-cover border border-border/20 shadow-xs shrink-0"
            />
            <div className="space-y-1 flex-1 min-w-0">
              <h4 className="font-extrabold text-sm text-foreground truncate">{selectedStudent.name}</h4>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5 truncate">
                <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span>{selectedStudent.email}</span>
              </p>
              {selectedStudent.phone && (
                <p className="text-xs text-muted-foreground flex items-center gap-1.5 font-mono truncate">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span>{selectedStudent.phone}</span>
                </p>
              )}
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 w-fit mt-0.5">
                <CheckCircle2 className="h-3 w-3" /> Registration Confirmed
              </span>
            </div>
          </div>

          {/* Workshop Details Card */}
          <div className="bg-muted/20 border border-black/5 dark:border-white/5 p-4 rounded-xl space-y-2">
            <div className="flex justify-between items-center border-b border-black/5 dark:border-white/5 pb-2">
              <span className="text-muted-foreground font-semibold">Enrolled Workshop:</span>
              <span className="font-bold text-foreground max-w-[220px] truncate">{program.title}</span>
            </div>

            <div className="flex justify-between items-center border-b border-black/5 dark:border-white/5 pb-2">
              <span className="text-muted-foreground font-semibold">Workshop Date & Time:</span>
              <span className="font-medium text-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3 text-muted-foreground" /> {program.date} at {program.time}
              </span>
            </div>

            <div className="flex justify-between items-center border-b border-black/5 dark:border-white/5 pb-2">
              <span className="text-muted-foreground font-semibold">Registration Date:</span>
              <span className="font-medium text-foreground">{selectedStudent.date}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-muted-foreground font-semibold">Reserved Seats / Spots:</span>
              <span className="font-bold text-foreground">{selectedStudent.spots} Ticket{selectedStudent.spots > 1 ? "s" : ""}</span>
            </div>
          </div>

          {/* Payment & Ticket Code Box */}
          <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-extrabold text-emerald-800 dark:text-emerald-300 text-xs uppercase tracking-wider">
                Total Payment Verified:
              </span>
              <span className="font-mono font-black text-base text-emerald-700 dark:text-[#a0f212]">
                ₹{selectedStudent.paid} INR
              </span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-emerald-500/20">
              <span className="text-emerald-800 dark:text-emerald-300 font-semibold text-[11px]">
                Check-in Verification Code:
              </span>
              <div className="flex items-center gap-1.5 bg-card px-2.5 py-1 rounded-lg border border-black/5 font-mono font-bold text-xs">
                <span>{ticketCode}</span>
                <button
                  type="button"
                  onClick={() => copyTicketCode(ticketCode)}
                  className="p-0.5 text-muted-foreground hover:text-foreground"
                  title="Copy Verification Code"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Refund Request Info (If Applicable) */}
          {selectedStudent.refundRequest && (
            <div className="bg-amber-500/10 border border-amber-500/20 p-3.5 rounded-xl space-y-1 text-amber-800 dark:text-amber-300">
              <div className="font-bold flex items-center justify-between text-[11px]">
                <span>Refund Demand Requested:</span>
                <span className="uppercase font-extrabold">{selectedStudent.refundRequest.status}</span>
              </div>
              <p className="text-[11px] italic">"{selectedStudent.refundRequest.reason || "No reason provided"}"</p>
              <div className="text-[10px] font-mono pt-1">
                Requested Amount: ₹{selectedStudent.refundRequest.refundAmount} ({selectedStudent.refundRequest.refundPercentage}% policy)
              </div>
            </div>
          )}

        </div>

        <DialogFooter className="gap-2 sm:gap-0 pt-2">
          <Button
            variant="outline"
            type="button"
            className="text-xs h-9 rounded-xl"
            onClick={onClose}
          >
            Close
          </Button>
          <Button 
            className="text-xs font-bold h-9 rounded-xl shadow-xs bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => {
              onVerifyTicket(selectedStudent.id);
              onClose();
            }}
          >
            <TicketCheck className="h-4 w-4 mr-1.5" />
            Verify Check-in Ticket
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
