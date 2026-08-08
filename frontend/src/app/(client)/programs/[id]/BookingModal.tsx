"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User as UserIcon, Mail, Phone, Calendar, MapPin, Globe, CreditCard,
  CheckCircle2, Loader2, Plus, Minus, ChevronRight, ChevronLeft, ChevronDown,
  Users, ShieldCheck, Ticket, AlertCircle, Receipt, X, BadgeCheck, Timer, Clock
} from "lucide-react";
import { useRazorpayCheckout } from "@/features/payment/hooks/useRazorpayCheckout";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from "@/components/ui/dialog";
import { Program } from "@/constants/mockData";
import { INDIAN_STATES } from "@/constants/states";
import { useAuthStore } from "@/features/auth/store/authStore";
import {
  useBookingModalStore, ParticipantDetail, PrimaryParticipant
} from "@/features/client/store/bookingModalStore";
import { primaryParticipantSchema, additionalParticipantSchema } from "@/features/client/validation/bookingValidation";

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
  "Review & Pay",
];

// ─── Helpers ───────────────────────────────────────────────────────────────────
function calcSummary(programFee: number, platformRate: number) {
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

  const { startCheckout, isLoading: rzpLoading, isSuccess: rzpSuccess, error: rzpError } = useRazorpayCheckout({
    onOpen: () => {
      // Close BookingModal so only the Razorpay checkout dialog is visible
      if (props.onOpenChange) props.onOpenChange(false);
      store.closeBookingModal();
    },
    onSuccess: (result) => {
      store.setPaymentLoading(false);
      store.setPaymentSuccess(true, result.booking?.bookingRef);
      if (store.onSuccessCallback) store.onSuccessCallback();
      // Redirect client to My Bookings page once Razorpay closes
      router.push("/dashboard/tickets");
    },
    onError: (msg) => {
      store.setPaymentLoading(false); 
      // Re-open BookingModal so user sees error banner / retry option
      if (props.onOpenChange) props.onOpenChange(true);
      useBookingModalStore.setState({ isOpen: true });
    },
  });

  // Resolve values from Store or Props for backward compatibility
  const isOpen = props.open !== undefined ? props.open : store.isOpen;
  const activeProgram = props.program || store.program;
  const isPaymentLoading = props.paymentLoading !== undefined ? props.paymentLoading : (store.paymentLoading || rzpLoading);
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

  const totalProgramFee = (store.primary.ticketType?.price ?? activeProgram.price) + 
    store.additionals.reduce((acc, p) => acc + (p.ticketType?.price ?? activeProgram.price), 0);

  const summary = calcSummary(totalProgramFee, platformRate);

  const validatePrimary = () => {
    // Primary participant validation with Zod
    const primaryResult = primaryParticipantSchema.safeParse(store.primary);
    const primaryErrs: Partial<Record<keyof PrimaryParticipant, string>> = {};

    if (!primaryResult.success) {
      for (const issue of primaryResult.error.issues) {
        const path = issue.path[0] as keyof PrimaryParticipant;
        if (path && !primaryErrs[path]) {
          primaryErrs[path] = issue.message;
        }
      }
    }
    store.setPrimaryErrors(primaryErrs);

    // Additional participants validation with Zod
    const additionalErrs: Record<number, Partial<Record<keyof ParticipantDetail, string>>> = {};
    let additionalsValid = true;

    store.additionals.forEach((add, idx) => {
      const addResult = additionalParticipantSchema.safeParse(add);
      if (!addResult.success) {
        additionalsValid = false;
        const errObj: Partial<Record<keyof ParticipantDetail, string>> = {};
        for (const issue of addResult.error.issues) {
          const path = issue.path[0] as keyof ParticipantDetail;
          if (path && !errObj[path]) {
            errObj[path] = issue.message;
          }
        }
        additionalErrs[idx] = errObj;
      }
    });

    store.setAdditionalErrors(additionalErrs);

    return primaryResult.success && additionalsValid;
  };

  const handleNext = () => {
    if (store.step === 1 && !validatePrimary()) return;
    store.setStep(Math.min(STEPS.length - 1, store.step + 1));
  };

  const handleBack = () => store.setStep(Math.max(0, store.step - 1));

  const handleRazorpayClick = async () => {
    if (props.onConfirmBooking) {
      await props.onConfirmBooking(store.qty);
      return;
    }
    if (!activeProgram) return;
    store.setPaymentLoading(true);
    try {
      await startCheckout(
        {
          eventId: activeProgram.id,
          seatCount: store.qty,
          participants: store.getFormattedParticipants(),
          customAmount: summary.total,
        },
        {
          name: store.primary.fullName || user?.firstName || "Guest",
          email: store.primary.email || user?.email || "",
          phone: store.primary.mobile || user?.phone || "",
        }
      );
    } catch {
      // errors handled by hook's onError callback
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
                          <div className="text-[11px] text-muted-foreground">Multiple ticket tiers can be chosen next</div>
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

                    {/* Quick summary removed from Step 0 */}
                  </div>
                )}

                {/* ── STEP 1: Primary Participant Details ── */}
                {store.step === 1 && (
                  <div className="space-y-5">
                    <div>
                      <h3 className="font-bold text-sm text-foreground mb-1">Primary Participant Details</h3>
                      <p className="text-[11px] text-muted-foreground">Account session contact info is locked. Name and state are editable.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {/* Ticket Type (If applicable) */}
                      {activeProgram.ticketTypes && activeProgram.ticketTypes.length > 0 && (
                        <div className="space-y-1.5 sm:col-span-2 bg-muted/20 p-4 rounded-xl border-2 border-primary/30 shadow-sm relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
                          <Label className="text-xs font-extrabold text-foreground flex items-center gap-1.5 ml-2">Ticket Tier *</Label>
                          <div className="ml-2 mt-1 relative">
                            <select className="h-10 w-full appearance-none border border-input rounded-lg bg-background text-foreground px-4 font-bold focus:outline-none focus:ring-2 focus:ring-primary shadow-sm cursor-pointer"
                              value={store.primary.ticketType?.name || ""} 
                              onChange={e => {
                                const t = activeProgram.ticketTypes!.find(x => x.name === e.target.value);
                                if (t) store.updatePrimaryField("ticketType", { id: (t as any).id, name: t.name, price: t.price } as any);
                              }}>
                              <option value="" disabled>Select Ticket Tier</option>
                              {activeProgram.ticketTypes.map(t => (
                                <option key={t.name} value={t.name}>{t.name} - ₹{t.price}</option>
                              ))}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                              <ChevronDown className="h-4 w-4" />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Full Name (Editable) */}
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold flex items-center gap-1.5"><UserIcon className="h-3 w-3 text-muted-foreground" /> Full Name *</Label>
                        <Input placeholder="e.g. Rohan Mehta" className="h-9 text-xs" value={store.primary.fullName}
                          onChange={e => store.updatePrimaryField("fullName", e.target.value)} />
                        {store.primaryErrors.fullName && <p className="text-[10px] text-destructive">{store.primaryErrors.fullName}</p>}
                      </div>

                      {/* Email (Read-Only / Disabled) */}
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold flex items-center gap-1.5"><Mail className="h-3 w-3 text-muted-foreground" /> Email Address (Locked)</Label>
                        <Input type="email" disabled placeholder="e.g. rohan@example.com" className="h-9 text-xs bg-muted/50 cursor-not-allowed opacity-75" value={store.primary.email}
                          readOnly title="Account email cannot be modified" />
                        {store.primaryErrors.email && <p className="text-[10px] text-destructive">{store.primaryErrors.email}</p>}
                      </div>

                      {/* Mobile (Read-Only / Disabled) */}
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold flex items-center gap-1.5"><Phone className="h-3 w-3 text-muted-foreground" /> Mobile Number (Locked)</Label>
                        <Input type="tel" disabled placeholder="e.g. +91 9876543210" className="h-9 text-xs bg-muted/50 cursor-not-allowed opacity-75" value={store.primary.mobile}
                          readOnly title="Account mobile number cannot be modified" />
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
                        <Input placeholder="e.g. Kochi" className="h-9 text-xs" value={store.primary.city}
                          onChange={e => store.updatePrimaryField("city", e.target.value)} />
                        {store.primaryErrors.city && <p className="text-[10px] text-destructive">{store.primaryErrors.city}</p>}
                      </div>

                      {/* State (Selectable Constants Dropdown) */}
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold flex items-center gap-1.5"><MapPin className="h-3 w-3 text-muted-foreground" /> State *</Label>
                        <select className="h-9 text-xs w-full border border-input rounded-md bg-background px-3 focus:outline-none focus:ring-2 focus:ring-ring"
                          value={store.primary.state} onChange={e => store.updatePrimaryField("state", e.target.value)}>
                          <option value="">Select State</option>
                          {INDIAN_STATES.map((st) => (
                            <option key={st} value={st}>{st}</option>
                          ))}
                        </select>
                        {store.primaryErrors.state && <p className="text-[10px] text-destructive">{store.primaryErrors.state}</p>}
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
                        {store.additionals.map((p, idx) => {
                          const errs = store.additionalErrors[idx] || {};
                          return (
                            <div key={idx} className="bg-muted/20 rounded-xl border p-3.5 space-y-3">
                              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Participant #{idx + 2}</span>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {/* Ticket Type (If applicable) */}
                                {activeProgram.ticketTypes && activeProgram.ticketTypes.length > 0 && (
                                  <div className="space-y-1 sm:col-span-2 bg-muted/20 p-3 rounded-xl border-2 border-primary/30 mb-2 relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                                    <Label className="text-[10px] font-extrabold text-foreground ml-1.5 uppercase tracking-wider">Ticket Tier *</Label>
                                    <div className="ml-1.5 relative mt-0.5">
                                      <select className="h-9 w-full appearance-none border border-input rounded-md bg-background text-foreground px-3 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary shadow-sm cursor-pointer"
                                        value={p.ticketType?.name || ""} 
                                        onChange={e => {
                                          const t = activeProgram.ticketTypes!.find(x => x.name === e.target.value);
                                          if (t) store.updateAdditionalField(idx, "ticketType", { id: (t as any).id, name: t.name, price: t.price } as any);
                                        }}>
                                        <option value="" disabled>Select Ticket Tier</option>
                                        {activeProgram.ticketTypes.map(t => (
                                          <option key={t.name} value={t.name}>{t.name} - ₹{t.price}</option>
                                        ))}
                                      </select>
                                      <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                                        <ChevronDown className="h-3.5 w-3.5" />
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Full Name */}
                                <div className="space-y-1">
                                  <Input placeholder="Full Name *" className="h-8 text-xs" value={p.fullName}
                                    onChange={e => store.updateAdditionalField(idx, "fullName", e.target.value)} />
                                  {errs.fullName && <p className="text-[10px] text-destructive">{errs.fullName}</p>}
                                </div>

                                {/* Email */}
                                <div className="space-y-1">
                                  <Input type="email" placeholder="Email Address *" className="h-8 text-xs" value={p.email}
                                    onChange={e => store.updateAdditionalField(idx, "email", e.target.value)} />
                                  {errs.email && <p className="text-[10px] text-destructive">{errs.email}</p>}
                                </div>

                                {/* Mobile */}
                                <div className="space-y-1">
                                  <Input type="tel" placeholder="Mobile Number *" className="h-8 text-xs" value={p.mobile}
                                    onChange={e => store.updateAdditionalField(idx, "mobile", e.target.value)} />
                                  {errs.mobile && <p className="text-[10px] text-destructive">{errs.mobile}</p>}
                                </div>

                                {/* Gender */}
                                <div className="space-y-1">
                                  <select className="h-8 text-xs w-full border border-input rounded-md bg-background px-2"
                                    value={p.gender} onChange={e => store.updateAdditionalField(idx, "gender", e.target.value)}>
                                    <option value="">Select Gender *</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                  </select>
                                  {errs.gender && <p className="text-[10px] text-destructive">{errs.gender}</p>}
                                </div>

                                {/* State Dropdown */}
                                <div className="space-y-1 sm:col-span-2">
                                  <select className="h-8 text-xs w-full border border-input rounded-md bg-background px-2"
                                    value={p.state} onChange={e => store.updateAdditionalField(idx, "state", e.target.value)}>
                                    <option value="">Select State *</option>
                                    {INDIAN_STATES.map((st) => (
                                      <option key={st} value={st}>{st}</option>
                                    ))}
                                  </select>
                                  {errs.state && <p className="text-[10px] text-destructive">{errs.state}</p>}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* ── STEP 2: Review, Agreements & Pay ── */}
                {store.step === 2 && (
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
                      
                      {/* Ticket Breakdown */}
                      <div className="space-y-2 py-3 border-y border-border/40 mb-3">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-muted-foreground truncate mr-2">{store.primary.fullName || "Primary Participant"} <span className="font-bold text-foreground">({store.primary.ticketType?.name || 'Standard'})</span></span>
                          <span className="font-medium shrink-0">₹{store.primary.ticketType?.price ?? activeProgram.price}</span>
                        </div>
                        {store.additionals.map((p, i) => (
                          <div key={i} className="flex justify-between items-center text-xs">
                            <span className="text-muted-foreground truncate mr-2">{p.fullName || `Participant #${i + 2}`} <span className="font-bold text-foreground">({p.ticketType?.name || 'Standard'})</span></span>
                            <span className="font-medium shrink-0">₹{p.ticketType?.price ?? activeProgram.price}</span>
                          </div>
                        ))}
                      </div>

                      <SummaryRow label="Program Fee Total" value={`₹${summary.programFee.toFixed(2)}`} />
                      <SummaryRow label={`Platform Fee (${(platformRate * 100).toFixed(1)}%)`} value={`₹${summary.platformFee.toFixed(2)}`} />
                      <Separator />
                      <SummaryRow label="Total Amount Due" value={`₹${summary.total.toFixed(2)}`} bold accent />
                    </div>

                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-500" />
                      <span>Instant 100% Confirmation Guarantee with Instant Pass Delivery.</span>
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

                    {rzpError && (
                      <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2.5 text-xs font-semibold text-red-600 dark:text-red-400">
                        <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
                        <span>{rzpError}</span>
                      </div>
                    )}

                    {!canProceedToConfirm && (
                      <div className="text-[11px] text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-lg flex items-center gap-2 font-medium">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>Please accept the Terms of Service & Cancellation Policy to enable payment.</span>
                      </div>
                    )}
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

                {store.step < 2 ? (
                  <Button size="sm" onClick={handleNext} className="text-xs rounded-xl h-9 px-5 bg-primary text-primary-foreground font-bold hover:bg-primary/90">
                    Continue <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                ) : (
                  <Button size="sm" onClick={handleRazorpayClick} disabled={isPaymentLoading || !canProceedToConfirm} className={`text-xs rounded-xl h-9 px-6 font-extrabold shadow-md transition-all ${!canProceedToConfirm ? 'bg-muted text-muted-foreground opacity-50 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}>
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
    </>
  );
}
