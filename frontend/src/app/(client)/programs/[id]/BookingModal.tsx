"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User as UserIcon, Mail, Phone, Calendar, MapPin, Globe, CreditCard,
  CheckCircle2, Loader2, Plus, Minus, ChevronRight, ChevronLeft,
  Users, ShieldCheck, Ticket, AlertCircle, Receipt, X, BadgeCheck, Timer, Clock
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from "@/components/ui/dialog";
import { Program } from "@/constants/mockData";
import { useAuthStore } from "@/features/auth/store/authStore";
import {
  useBookingModalStore, ParticipantDetail, PrimaryParticipant
} from "@/features/client/store/bookingModalStore";

interface BookingModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  program?: Program | null;
  onConfirmBooking?: (spotsCount: number) => Promise<void>;
  paymentLoading?: boolean;
  paymentSuccess?: boolean;
  onClose?: () => void;
}

// ─── Step Labels ───────────────────────────────────────────────────────────────
const STEPS = [
  "Participants",
  "Primary Details",
  "Payment",
  "Confirm",
];

// ─── Helpers ───────────────────────────────────────────────────────────────────
function calcSummary(price: number, qty: number, platformRate: number) {
  const programFee = price * qty;
  const discount = 0;
  const platformFee = Math.round(programFee * platformRate * 100) / 100;
  const total = programFee - discount + platformFee;
  return { programFee, discount, platformFee, taxes: 0, total };
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function StepBadge({ step, current, label }: { step: number; current: number; label: string }) {
  const done = current > step;
  const active = current === step;
  return (
    <div className="flex flex-col items-center gap-1 min-w-0">
      <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-200 ${done ? "bg-emerald-500 border-emerald-500 text-white" :
          active ? "bg-primary border-primary text-primary-foreground" :
            "bg-muted border-border text-muted-foreground"
        }`}>
        {done ? <BadgeCheck className="h-3.5 w-3.5" /> : step + 1}
      </div>
      <span className={`text-[9px] font-semibold hidden sm:block truncate ${active ? "text-primary" : done ? "text-emerald-500" : "text-muted-foreground"}`}>
        {label}
      </span>
    </div>
  );
}

function SummaryRow({ label, value, bold, accent }: { label: string; value: string; bold?: boolean; accent?: boolean }) {
  return (
    <div className="flex justify-between items-center text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className={`${bold ? "font-extrabold text-sm" : "font-semibold"} ${accent ? "text-primary" : "text-foreground"}`}>{value}</span>
    </div>
  );
}

// ─── Main Modal ────────────────────────────────────────────────────────────────
export default function BookingModal(props: BookingModalProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const store = useBookingModalStore();

  // Resolve values from Store or Props for backward compatibility
  const isOpen = props.open !== undefined ? props.open : store.isOpen;
  const activeProgram = props.program || store.program;
  const isPaymentLoading = props.paymentLoading !== undefined ? props.paymentLoading : store.paymentLoading;
  const isPaymentSuccess = props.paymentSuccess !== undefined ? props.paymentSuccess : store.paymentSuccess;

  // Auto pre-fill user placeholders when modal is open and user is logged in
  useEffect(() => {
    if (isOpen && user) {
      const defaultName = user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim();
      const defaultEmail = user.email || "";
      const defaultMobile = user.phone || "";

      if (!store.primary.fullName || !store.primary.email || !store.primary.mobile) {
        store.updatePrimaryField("fullName", store.primary.fullName || defaultName);
        store.updatePrimaryField("email", store.primary.email || defaultEmail);
        store.updatePrimaryField("mobile", store.primary.mobile || defaultMobile);
      }
    }
  }, [isOpen, user]);

  if (!activeProgram) return null;

  const platformRate = activeProgram.commission?.commissionType === "PERCENTAGE"
    ? Number(activeProgram.commission.platformValue) / 100
    : 0;

  const summary = calcSummary(activeProgram.price, store.qty, platformRate);

  const validatePrimary = () => {
    const errs: Partial<Record<keyof PrimaryParticipant, string>> = {};
    if (!store.primary.fullName.trim()) errs.fullName = "Full name is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(store.primary.email)) errs.email = "Valid email is required";
    if (!/^\+?[\d\s-]{7,15}$/.test(store.primary.mobile)) errs.mobile = "Valid mobile number is required";
    if (!store.primary.dob) errs.dob = "Date of birth is required";
    if (!store.primary.gender) errs.gender = "Gender is required";
    if (!store.primary.city.trim()) errs.city = "City is required";
    store.setPrimaryErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (store.step === 1 && !validatePrimary()) return;
    store.setStep(Math.min(STEPS.length - 1, store.step + 1));
  };

  const handleBack = () => store.setStep(Math.max(0, store.step - 1));

  const handleRazorpayClick = async () => {
    if (props.onConfirmBooking) {
      await props.onConfirmBooking(store.qty);
    } else {
      store.setRazorpayAlert(true);
    }
  };

  const handleFakePaymentApprove = async () => {
    store.setRazorpayAlert(false);
    if (props.onConfirmBooking) {
      await props.onConfirmBooking(store.qty);
    } else {
      store.setPaymentLoading(true);
      setTimeout(() => {
        const ref = `BK-${Date.now().toString(36).toUpperCase()}`;
        store.setPaymentLoading(false);
        store.setPaymentSuccess(true, ref);
        if (store.onSuccessCallback) store.onSuccessCallback();
      }, 1200);
    }
  };

  const handleClose = () => {
    if (props.onClose) props.onClose();
    if (props.onOpenChange) props.onOpenChange(false);
    store.closeBookingModal();
  };

  const handleResetAndClose = () => {
    store.resetBooking();
    handleClose();
  };

  const canProceedToConfirm = store.termsAgreed && store.cancellationAgreed;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(o) => { if (!o) handleClose(); }}>
        <DialogContent className="max-w-2xl w-full max-h-[92vh] overflow-hidden flex flex-col p-0 gap-0 rounded-2xl border-border/50 bg-background shadow-2xl">
          {/* Header */}
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/30 shrink-0">
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <div className="h-7 w-7 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                <Ticket className="h-4 w-4" />
              </div>
              Book Workshop
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground truncate">
              {activeProgram.title}
            </DialogDescription>
          </DialogHeader>

          {isPaymentSuccess ? (
            /* ─── SUCCESS SCREEN ─────────────────────────────────────── */
            <div className="flex-1 flex flex-col items-center justify-center py-10 px-6 text-center space-y-5">
              <div className="h-16 w-16 bg-emerald-500/10 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-9 w-9 text-emerald-500" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-xl font-extrabold text-foreground">Booking Confirmed!</h3>
                <p className="text-xs text-muted-foreground max-w-xs">
                  Your spot has been reserved. A confirmation email, SMS, and invoice have been dispatched.
                </p>
              </div>

              <div className="bg-muted/40 rounded-xl border p-4 text-left space-y-2.5 w-full max-w-sm">
                <div className="flex justify-between text-xs"><span className="text-muted-foreground">Booking ID</span><span className="font-bold text-foreground font-mono">{store.bookingRef || `BK-${Date.now().toString(36).toUpperCase()}`}</span></div>
                <div className="flex justify-between text-xs"><span className="text-muted-foreground">Program</span><span className="font-semibold text-foreground max-w-[180px] truncate">{activeProgram.title}</span></div>
                <div className="flex justify-between text-xs"><span className="text-muted-foreground">Participants</span><span className="font-semibold text-foreground">{store.qty}</span></div>
                <div className="flex justify-between text-xs"><span className="text-muted-foreground">Amount Paid</span><span className="font-extrabold text-foreground">₹{summary.total.toFixed(2)}</span></div>
                <Separator />
                <div className="text-[10px] text-muted-foreground text-center">Status: <span className="text-emerald-500 font-bold">Booking Confirmed ✓</span></div>
              </div>

              <div className="space-y-1.5 text-[10px] text-muted-foreground">
                <div className="flex items-center gap-1.5 justify-center"><CheckCircle2 className="h-3 w-3 text-emerald-500" /> Confirmation Email Sent</div>
                <div className="flex items-center gap-1.5 justify-center"><CheckCircle2 className="h-3 w-3 text-emerald-500" /> SMS Notification Dispatched</div>
                <div className="flex items-center gap-1.5 justify-center"><CheckCircle2 className="h-3 w-3 text-emerald-500" /> WhatsApp Confirmation Sent</div>
                <div className="flex items-center gap-1.5 justify-center"><Receipt className="h-3 w-3 text-emerald-500" /> Invoice/Receipt Generated</div>
              </div>

              <div className="flex gap-2 w-full max-w-sm pt-2">
                <Button variant="outline" className="flex-1 text-xs rounded-xl h-10" onClick={handleResetAndClose}>
                  Close
                </Button>
                <Button className="flex-1 text-xs rounded-xl h-10" onClick={() => { handleResetAndClose(); router.push("/dashboard/tickets"); }}>
                  My Bookings
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Step Indicators */}
              <div className="px-6 py-3 border-b border-border/20 shrink-0">
                <div className="flex items-center justify-between relative">
                  <div className="absolute left-0 right-0 top-3.5 h-px bg-border/40 -z-0 mx-8" />
                  {STEPS.map((label, i) => (
                    <StepBadge key={i} step={i} current={store.step} label={label} />
                  ))}
                </div>
              </div>

              {/* Scrollable Content Area */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

                {/* ── STEP 0: Participants ── */}
                {store.step === 0 && (
                  <div className="space-y-5">
                    <div>
                      <h3 className="font-bold text-sm text-foreground mb-1">Number of Participants</h3>
                      <p className="text-[11px] text-muted-foreground">Select how many seats you want to reserve.</p>
                    </div>

                    <div className="flex items-center justify-between bg-muted/30 p-4 rounded-xl border">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 text-primary p-2.5 rounded-lg">
                          <Users className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-bold text-sm text-foreground">Participants</div>
                          <div className="text-[11px] text-muted-foreground">₹{activeProgram.price} per seat</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button type="button"
                          onClick={() => store.setQty(Math.max(1, store.qty - 1))}
                          disabled={store.qty === 1}
                          className="h-8 w-8 rounded-lg border bg-card flex items-center justify-center disabled:opacity-40 hover:bg-muted transition-colors active:scale-95"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-8 text-center font-extrabold text-lg text-foreground">{store.qty}</span>
                        <button type="button"
                          onClick={() => store.setQty(Math.min(activeProgram.spotsLeft || 50, store.qty + 1))}
                          disabled={store.qty >= (activeProgram.spotsLeft || 50)}
                          className="h-8 w-8 rounded-lg border bg-card flex items-center justify-center disabled:opacity-40 hover:bg-muted transition-colors active:scale-95"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Quick Summary */}
                    <div className="bg-muted/20 rounded-xl border p-4 space-y-2.5">
                      <SummaryRow label="Program Fee" value={`₹${summary.programFee.toFixed(2)}`} />
                      <SummaryRow label={`Platform Fee (${(platformRate * 100).toFixed(1)}%)`} value={`₹${summary.platformFee.toFixed(2)}`} />
                      {summary.discount > 0 && <SummaryRow label="Discount" value={`-₹${summary.discount.toFixed(2)}`} accent />}
                      <Separator />
                      <SummaryRow label="Total Payable" value={`₹${summary.total.toFixed(2)}`} bold accent />
                    </div>
                  </div>
                )}

                {/* ── STEP 1: Primary Participant Details ── */}
                {store.step === 1 && (
                  <div className="space-y-5">
                    <div>
                      <h3 className="font-bold text-sm text-foreground mb-1">Primary Participant Details</h3>
                      <p className="text-[11px] text-muted-foreground">These details are auto-populated from your account session.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {/* Full Name */}
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold flex items-center gap-1.5"><UserIcon className="h-3 w-3 text-muted-foreground" /> Full Name *</Label>
                        <Input placeholder="e.g. Rohan Mehta" className="h-9 text-xs" value={store.primary.fullName}
                          onChange={e => store.updatePrimaryField("fullName", e.target.value)} />
                        {store.primaryErrors.fullName && <p className="text-[10px] text-destructive">{store.primaryErrors.fullName}</p>}
                      </div>

                      {/* Email */}
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold flex items-center gap-1.5"><Mail className="h-3 w-3 text-muted-foreground" /> Email Address *</Label>
                        <Input type="email" placeholder="e.g. rohan@example.com" className="h-9 text-xs" value={store.primary.email}
                          onChange={e => store.updatePrimaryField("email", e.target.value)} />
                        {store.primaryErrors.email && <p className="text-[10px] text-destructive">{store.primaryErrors.email}</p>}
                      </div>

                      {/* Mobile */}
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold flex items-center gap-1.5"><Phone className="h-3 w-3 text-muted-foreground" /> Mobile Number *</Label>
                        <Input type="tel" placeholder="e.g. +91 9876543210" className="h-9 text-xs" value={store.primary.mobile}
                          onChange={e => store.updatePrimaryField("mobile", e.target.value)} />
                        {store.primaryErrors.mobile && <p className="text-[10px] text-destructive">{store.primaryErrors.mobile}</p>}
                      </div>

                      {/* DOB */}
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold flex items-center gap-1.5"><Calendar className="h-3 w-3 text-muted-foreground" /> Date of Birth *</Label>
                        <Input type="date" className="h-9 text-xs" value={store.primary.dob}
                          onChange={e => store.updatePrimaryField("dob", e.target.value)} />
                        {store.primaryErrors.dob && <p className="text-[10px] text-destructive">{store.primaryErrors.dob}</p>}
                      </div>

                      {/* Gender */}
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">Gender *</Label>
                        <select className="h-9 text-xs w-full border border-input rounded-md bg-background px-3 focus:outline-none focus:ring-2 focus:ring-ring"
                          value={store.primary.gender} onChange={e => store.updatePrimaryField("gender", e.target.value)}>
                          <option value="">Select Gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="non-binary">Non-binary</option>
                          <option value="prefer-not-to-say">Prefer not to say</option>
                        </select>
                        {store.primaryErrors.gender && <p className="text-[10px] text-destructive">{store.primaryErrors.gender}</p>}
                      </div>

                      {/* City */}
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold flex items-center gap-1.5"><MapPin className="h-3 w-3 text-muted-foreground" /> City *</Label>
                        <Input placeholder="e.g. Mumbai" className="h-9 text-xs" value={store.primary.city}
                          onChange={e => store.updatePrimaryField("city", e.target.value)} />
                        {store.primaryErrors.city && <p className="text-[10px] text-destructive">{store.primaryErrors.city}</p>}
                      </div>

                      {/* State */}
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold flex items-center gap-1.5"><MapPin className="h-3 w-3 text-muted-foreground" /> State</Label>
                        <Input placeholder="e.g. Maharashtra" className="h-9 text-xs" value={store.primary.state}
                          onChange={e => store.updatePrimaryField("state", e.target.value)} />
                      </div>

                      {/* Country */}
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold flex items-center gap-1.5"><Globe className="h-3 w-3 text-muted-foreground" /> Country</Label>
                        <Input placeholder="India" className="h-9 text-xs" value={store.primary.country}
                          onChange={e => store.updatePrimaryField("country", e.target.value)} />
                      </div>
                    </div>

                    {/* Additional Participants */}
                    {store.qty > 1 && (
                      <div className="space-y-4 pt-2">
                        <Separator />
                        <h4 className="font-bold text-xs text-foreground">Additional Participants ({store.qty - 1})</h4>
                        {store.additionals.map((p, idx) => (
                          <div key={idx} className="bg-muted/20 rounded-xl border p-3.5 space-y-3">
                            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Participant #{idx + 2}</span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <Input placeholder="Full Name" className="h-8 text-xs" value={p.fullName}
                                onChange={e => store.updateAdditionalField(idx, "fullName", e.target.value)} />
                              <Input type="email" placeholder="Email" className="h-8 text-xs" value={p.email}
                                onChange={e => store.updateAdditionalField(idx, "email", e.target.value)} />
                              <Input type="tel" placeholder="Mobile" className="h-8 text-xs" value={p.mobile}
                                onChange={e => store.updateAdditionalField(idx, "mobile", e.target.value)} />
                              <select className="h-8 text-xs w-full border border-input rounded-md bg-background px-2"
                                value={p.gender} onChange={e => store.updateAdditionalField(idx, "gender", e.target.value)}>
                                <option value="">Gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                              </select>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ── STEP 2: Payment Gateways & Agreements ── */}
                {store.step === 2 && (
                  <div className="space-y-5">
                    <div>
                      <h3 className="font-bold text-sm text-foreground mb-1">Select Payment Gateway</h3>
                      <p className="text-[11px] text-muted-foreground">Supports UPI Apps (Google Pay, PhonePe, Paytm, BHIM), Cards & Netbanking.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Razorpay Card */}
                      <button type="button" onClick={handleRazorpayClick}
                        className="bg-card border-2 border-primary/40 hover:border-primary p-4 rounded-xl text-left transition-all relative overflow-hidden group shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <div className="h-8 w-8 bg-blue-500/10 text-blue-500 rounded-lg flex items-center justify-center font-black text-xs">
                            RZP
                          </div>
                          <span className="text-[9px] bg-primary/10 text-primary font-bold px-1.5 py-0.5 rounded">Recommended</span>
                        </div>
                        <div className="font-bold text-xs text-foreground group-hover:text-primary transition-colors">Razorpay Gateway</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">UPI, GPay, PhonePe, Cards, Netbanking</div>
                      </button>

                      {/* Cashfree / Stripe Placeholder */}
                      <div className="bg-muted/30 border border-border/50 p-4 rounded-xl text-left opacity-60 relative">
                        <div className="flex justify-between items-start mb-2">
                          <div className="h-8 w-8 bg-purple-500/10 text-purple-500 rounded-lg flex items-center justify-center font-black text-xs">
                            CF
                          </div>
                          <span className="text-[9px] bg-muted text-muted-foreground font-medium px-1.5 py-0.5 rounded">Secondary</span>
                        </div>
                        <div className="font-bold text-xs text-foreground">Cashfree / Stripe</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">Automated Gateway Backup</div>
                      </div>
                    </div>

                    {/* Terms Checkboxes */}
                    <div className="bg-muted/20 border rounded-xl p-4 space-y-3">
                      <h4 className="font-bold text-xs text-foreground flex items-center gap-1.5">
                        <ShieldCheck className="h-4 w-4 text-primary" /> Policies & Agreements
                      </h4>

                      <label className="flex items-start gap-2.5 cursor-pointer">
                        <input type="checkbox" checked={store.termsAgreed} onChange={e => store.setTermsAgreed(e.target.checked)}
                          className="mt-0.5 h-4 w-4 rounded border-input text-primary focus:ring-primary" />
                        <span className="text-[11px] text-muted-foreground leading-tight">
                          I agree to the <span className="text-primary font-semibold underline">Terms of Service</span> and Workshop Code of Conduct.
                        </span>
                      </label>

                      <label className="flex items-start gap-2.5 cursor-pointer">
                        <input type="checkbox" checked={store.cancellationAgreed} onChange={e => store.setCancellationAgreed(e.target.checked)}
                          className="mt-0.5 h-4 w-4 rounded border-input text-primary focus:ring-primary" />
                        <span className="text-[11px] text-muted-foreground leading-tight">
                          I acknowledge the <span className="text-primary font-semibold underline">Cancellation & Refund Policy</span> (100% refund up to 48 hours prior).
                        </span>
                      </label>

                      <label className="flex items-start gap-2.5 cursor-pointer">
                        <input type="checkbox" checked={store.notificationsAgreed} onChange={e => store.setNotificationsAgreed(e.target.checked)}
                          className="mt-0.5 h-4 w-4 rounded border-input text-primary focus:ring-primary" />
                        <span className="text-[11px] text-muted-foreground leading-tight">
                          Receive WhatsApp updates & Calendar invites for this workshop session.
                        </span>
                      </label>
                    </div>

                    {!canProceedToConfirm && (
                      <div className="text-[11px] text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-lg flex items-center gap-2 font-medium">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>Please accept the Terms of Service & Cancellation Policy to continue.</span>
                      </div>
                    )}
                  </div>
                )}

                {/* ── STEP 3: Order Review & Final Confirmation ── */}
                {store.step === 3 && (
                  <div className="space-y-5">
                    <div>
                      <h3 className="font-bold text-sm text-foreground mb-1">Review & Confirm Booking</h3>
                      <p className="text-[11px] text-muted-foreground">Please double check your reservation details before making payment.</p>
                    </div>

                    {/* Workshop */}
                    <div className="bg-muted/20 rounded-xl border p-4 space-y-2.5">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Workshop</div>
                      <div className="font-bold text-sm text-foreground">{activeProgram?.title}</div>
                      <div className="grid grid-cols-2 gap-1.5 text-[11px] text-muted-foreground">
                        <span>📅 {activeProgram?.date}</span>
                        <span>⏰ {activeProgram?.time}</span>
                        <span>⏱ {activeProgram?.duration}</span>
                        <span>📍 {activeProgram?.location?.split(",")[0]}</span>
                      </div>
                      <SummaryRow label="Program Fee" value={`₹${summary.programFee.toFixed(2)}`} />
                      <SummaryRow label={`Platform Fee (${(platformRate * 100).toFixed(1)}%)`} value={`₹${summary.platformFee.toFixed(2)}`} />
                      <Separator />
                      <SummaryRow label="Total Amount Due" value={`₹${summary.total.toFixed(2)}`} bold accent />
                    </div>

                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-500" />
                      <span>Instant 100% Confirmation Guarantee with Instant Pass Delivery.</span>
                    </div>
                  </div>
                )}

              </div>

              {/* Modal Footer Controls */}
              <div className="px-6 py-4 border-t border-border/30 flex items-center justify-between shrink-0 bg-muted/10">
                {store.step > 0 ? (
                  <Button variant="outline" size="sm" onClick={handleBack} disabled={isPaymentLoading} className="text-xs rounded-xl h-9">
                    <ChevronLeft className="h-4 w-4 mr-1" /> Back
                  </Button>
                ) : (
                  <Button variant="ghost" size="sm" onClick={handleResetAndClose} className="text-xs rounded-xl h-9">
                    Cancel
                  </Button>
                )}

                {store.step < 3 ? (
                  <Button size="sm" onClick={handleNext} disabled={store.step === 2 && !canProceedToConfirm} className="text-xs rounded-xl h-9 px-5 bg-primary text-primary-foreground font-bold hover:bg-primary/90">
                    Continue <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                ) : (
                  <Button size="sm" onClick={handleRazorpayClick} disabled={isPaymentLoading} className="text-xs rounded-xl h-9 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold shadow-md">
                    {isPaymentLoading ? (
                      <span className="flex items-center"><Loader2 className="h-4 w-4 animate-spin mr-1.5" /> Processing...</span>
                    ) : (
                      <span className="flex items-center"><CreditCard className="h-4 w-4 mr-1.5" /> Pay ₹{summary.total.toFixed(2)}</span>
                    )}
                  </Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Razorpay UPI / Payment Modal Simulation */}
      <Dialog open={store.razorpayAlert} onOpenChange={store.setRazorpayAlert}>
        <DialogContent className="sm:max-w-md rounded-2xl p-6 border-2 border-blue-500/30 bg-background shadow-2xl">
          <div className="text-center space-y-4">
            <div className="mx-auto w-14 h-14 bg-blue-500/10 border border-blue-500/30 rounded-2xl flex items-center justify-center">
              <CreditCard className="h-7 w-7 text-blue-500" />
            </div>

            <div className="space-y-1">
              <div className="text-xs font-extrabold text-blue-500 uppercase tracking-wider">Razorpay Gateway Simulation</div>
              <h3 className="text-lg font-black text-foreground">Complete Payment ₹{summary.total.toFixed(2)}</h3>
              <p className="text-xs text-muted-foreground">
                Select your preferred UPI app or click approve to simulate gateway payment callback.
              </p>
            </div>

            <div className="p-3 bg-muted/40 rounded-xl border text-xs text-left space-y-1.5">
              <div className="flex justify-between"><span className="text-muted-foreground">Merchant</span><span className="font-bold text-foreground">BookMyTraining Pvt Ltd</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Amount</span><span className="font-extrabold text-emerald-600">₹{summary.total.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">UPI Methods</span><span className="font-semibold text-foreground">GPay / PhonePe / Paytm</span></div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1 text-xs rounded-xl h-10" onClick={() => store.setRazorpayAlert(false)}>
                Cancel
              </Button>
              <Button className="flex-1 text-xs rounded-xl h-10 font-bold bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleFakePaymentApprove}>
                Approve Payment ✓
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
