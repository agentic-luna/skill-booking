"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  User, Mail, Phone, Calendar, MapPin, Globe, CreditCard,
  CheckCircle2, Loader2, Plus, Minus, ChevronRight, ChevronLeft,
  Users, ShieldCheck, Ticket, AlertCircle, Receipt, X, BadgeCheck
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from "@/components/ui/dialog";
import { Program } from "@/constants/mockData";

// ─── Types ─────────────────────────────────────────────────────────────────────
interface ParticipantDetail {
  fullName: string;
  email: string;
  mobile: string;
  age: string;
  gender: string;
}

interface PrimaryParticipant {
  fullName: string;
  email: string;
  mobile: string;
  dob: string;
  gender: string;
  city: string;
  state: string;
  country: string;
}

interface BookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  program: Program;
  onConfirmBooking: (spotsCount: number) => Promise<void>;
  paymentLoading: boolean;
  paymentSuccess: boolean;
  onClose: () => void;
}

// ─── Step Labels ───────────────────────────────────────────────────────────────
const STEPS = [
  "Participants",
  "Primary Details",
  "Payment",
  "Confirm",
];

// ─── Helpers ───────────────────────────────────────────────────────────────────
const PLATFORM_FEE_RATE = 0.025; // 2.5%
const TAX_RATE = 0.18; // 18% GST

function calcSummary(price: number, qty: number) {
  const programFee = price * qty;
  const discount = 0;
  const platformFee = Math.round(programFee * PLATFORM_FEE_RATE * 100) / 100;
  const taxable = programFee - discount + platformFee;
  const taxes = Math.round(taxable * TAX_RATE * 100) / 100;
  const total = taxable + taxes;
  return { programFee, discount, platformFee, taxes, total };
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function StepBadge({ step, current, label }: { step: number; current: number; label: string }) {
  const done = current > step;
  const active = current === step;
  return (
    <div className="flex flex-col items-center gap-1 min-w-0">
      <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-200 ${
        done ? "bg-emerald-500 border-emerald-500 text-white" :
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
export default function BookingModal({
  open, onOpenChange, program, onConfirmBooking,
  paymentLoading, paymentSuccess, onClose
}: BookingModalProps) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [qty, setQty] = useState(1);
  const [razorpayAlert, setRazorpayAlert] = useState(false);

  const [primary, setPrimary] = useState<PrimaryParticipant>({
    fullName: "", email: "", mobile: "", dob: "", gender: "", city: "", state: "", country: "India",
  });

  const [additionals, setAdditionals] = useState<ParticipantDetail[]>([]);

  const [termsAgreed, setTermsAgreed] = useState(false);
  const [cancellationAgreed, setCancellationAgreed] = useState(false);
  const [notificationsAgreed, setNotificationsAgreed] = useState(false);

  const [primaryErrors, setPrimaryErrors] = useState<Partial<Record<keyof PrimaryParticipant, string>>>({});

  const summary = calcSummary(program.price, qty);

  // Sync additionals array size with qty
  React.useEffect(() => {
    const extra = qty - 1;
    setAdditionals(prev => {
      if (prev.length < extra) {
        return [...prev, ...Array(extra - prev.length).fill({ fullName: "", email: "", mobile: "", age: "", gender: "" })];
      }
      return prev.slice(0, extra);
    });
  }, [qty]);

  const updateAdditional = (idx: number, field: keyof ParticipantDetail, val: string) => {
    setAdditionals(prev => prev.map((p, i) => i === idx ? { ...p, [field]: val } : p));
  };

  const validatePrimary = () => {
    const errs: Partial<Record<keyof PrimaryParticipant, string>> = {};
    if (!primary.fullName.trim()) errs.fullName = "Full name is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(primary.email)) errs.email = "Valid email is required";
    if (!/^\+?[\d\s-]{7,15}$/.test(primary.mobile)) errs.mobile = "Valid mobile number is required";
    if (!primary.dob) errs.dob = "Date of birth is required";
    if (!primary.gender) errs.gender = "Gender is required";
    if (!primary.city.trim()) errs.city = "City is required";
    setPrimaryErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && !validatePrimary()) return;
    setStep(s => Math.min(STEPS.length - 1, s + 1));
  };

  const handleBack = () => setStep(s => Math.max(0, s - 1));

  const handleRazorpayClick = () => {
    setRazorpayAlert(true);
  };

  const handleFakePaymentApprove = async () => {
    setRazorpayAlert(false);
    await onConfirmBooking(qty);
  };

  const handleReset = () => {
    setStep(0); setQty(1); setTermsAgreed(false); setCancellationAgreed(false);
    setNotificationsAgreed(false); setPrimary({ fullName: "", email: "", mobile: "", dob: "", gender: "", city: "", state: "", country: "India" });
    setAdditionals([]); setPrimaryErrors({});
  };

  const canProceedToConfirm = termsAgreed && cancellationAgreed;

  return (
    <>
      <Dialog open={open} onOpenChange={(o) => { if (!o) { handleReset(); onOpenChange(false); } }}>
        <DialogContent className="max-w-2xl w-full max-h-[92vh] overflow-hidden flex flex-col p-0 gap-0 rounded-2xl border-border/50">
          {/* Header */}
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/30 shrink-0">
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <div className="h-7 w-7 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                <Ticket className="h-4 w-4" />
              </div>
              Book Workshop
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground truncate">
              {program.title}
            </DialogDescription>
          </DialogHeader>

          {paymentSuccess ? (
            /* ─── SUCCESS SCREEN ─────────────────────────────────────── */
            <div className="flex-1 flex flex-col items-center justify-center py-10 px-6 text-center space-y-5">
              <div className="h-16 w-16 bg-emerald-500/10 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-9 w-9 text-emerald-500" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-xl font-extrabold text-foreground">Booking Confirmed! 🎉</h3>
                <p className="text-xs text-muted-foreground max-w-xs">
                  Your spot has been reserved. A confirmation email, SMS, and invoice have been dispatched.
                </p>
              </div>

              <div className="bg-muted/40 rounded-xl border p-4 text-left space-y-2.5 w-full max-w-sm">
                <div className="flex justify-between text-xs"><span className="text-muted-foreground">Booking ID</span><span className="font-bold text-foreground font-mono">BK-{Date.now().toString(36).toUpperCase()}</span></div>
                <div className="flex justify-between text-xs"><span className="text-muted-foreground">Program</span><span className="font-semibold text-foreground max-w-[180px] truncate">{program.title}</span></div>
                <div className="flex justify-between text-xs"><span className="text-muted-foreground">Participants</span><span className="font-semibold text-foreground">{qty}</span></div>
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
                <Button variant="outline" className="flex-1 text-xs rounded-xl h-10" onClick={() => { handleReset(); onClose(); }}>
                  Close
                </Button>
                <Button className="flex-1 text-xs rounded-xl h-10" onClick={() => { handleReset(); onClose(); router.push("/dashboard/tickets"); }}>
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
                    <StepBadge key={i} step={i} current={step} label={label} />
                  ))}
                </div>
              </div>

              {/* Scrollable Content Area */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

                {/* ── STEP 0: Participants ── */}
                {step === 0 && (
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
                          <div className="text-[11px] text-muted-foreground">₹{program.price} per seat</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button type="button"
                          onClick={() => setQty(q => Math.max(1, q - 1))}
                          disabled={qty === 1}
                          className="h-8 w-8 rounded-lg border bg-card flex items-center justify-center disabled:opacity-40 hover:bg-muted transition-colors active:scale-95"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-8 text-center font-extrabold text-lg text-foreground">{qty}</span>
                        <button type="button"
                          onClick={() => setQty(q => Math.min(program.spotsLeft, q + 1))}
                          disabled={qty >= program.spotsLeft}
                          className="h-8 w-8 rounded-lg border bg-card flex items-center justify-center disabled:opacity-40 hover:bg-muted transition-colors active:scale-95"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Quick Summary */}
                    <div className="bg-muted/20 rounded-xl border p-4 space-y-2.5">
                      <SummaryRow label="Program Fee" value={`₹${summary.programFee.toFixed(2)}`} />
                      <SummaryRow label={`Platform Fee (2.5%)`} value={`₹${summary.platformFee.toFixed(2)}`} />
                      <SummaryRow label="Taxes (GST 18%)" value={`₹${summary.taxes.toFixed(2)}`} />
                      {summary.discount > 0 && <SummaryRow label="Discount" value={`-₹${summary.discount.toFixed(2)}`} accent />}
                      <Separator />
                      <SummaryRow label="Total Payable" value={`₹${summary.total.toFixed(2)}`} bold accent />
                    </div>
                  </div>
                )}

                {/* ── STEP 1: Primary Participant Details ── */}
                {step === 1 && (
                  <div className="space-y-5">
                    <div>
                      <h3 className="font-bold text-sm text-foreground mb-1">Primary Participant Details</h3>
                      <p className="text-[11px] text-muted-foreground">These details are for the main booking contact.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {/* Full Name */}
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold flex items-center gap-1.5"><User className="h-3 w-3 text-muted-foreground" /> Full Name *</Label>
                        <Input placeholder="e.g. Rohan Mehta" className="h-9 text-xs" value={primary.fullName}
                          onChange={e => setPrimary(p => ({ ...p, fullName: e.target.value }))} />
                        {primaryErrors.fullName && <p className="text-[10px] text-destructive">{primaryErrors.fullName}</p>}
                      </div>

                      {/* Email */}
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold flex items-center gap-1.5"><Mail className="h-3 w-3 text-muted-foreground" /> Email Address *</Label>
                        <Input type="email" placeholder="e.g. rohan@example.com" className="h-9 text-xs" value={primary.email}
                          onChange={e => setPrimary(p => ({ ...p, email: e.target.value }))} />
                        {primaryErrors.email && <p className="text-[10px] text-destructive">{primaryErrors.email}</p>}
                      </div>

                      {/* Mobile */}
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold flex items-center gap-1.5"><Phone className="h-3 w-3 text-muted-foreground" /> Mobile Number *</Label>
                        <Input type="tel" placeholder="e.g. +91 9876543210" className="h-9 text-xs" value={primary.mobile}
                          onChange={e => setPrimary(p => ({ ...p, mobile: e.target.value }))} />
                        {primaryErrors.mobile && <p className="text-[10px] text-destructive">{primaryErrors.mobile}</p>}
                      </div>

                      {/* DOB */}
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold flex items-center gap-1.5"><Calendar className="h-3 w-3 text-muted-foreground" /> Date of Birth *</Label>
                        <Input type="date" className="h-9 text-xs" value={primary.dob}
                          onChange={e => setPrimary(p => ({ ...p, dob: e.target.value }))} />
                        {primaryErrors.dob && <p className="text-[10px] text-destructive">{primaryErrors.dob}</p>}
                      </div>

                      {/* Gender */}
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">Gender *</Label>
                        <select className="h-9 text-xs w-full border border-input rounded-md bg-background px-3 focus:outline-none focus:ring-2 focus:ring-ring"
                          value={primary.gender} onChange={e => setPrimary(p => ({ ...p, gender: e.target.value }))}>
                          <option value="">Select Gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="non-binary">Non-binary</option>
                          <option value="prefer-not-to-say">Prefer not to say</option>
                        </select>
                        {primaryErrors.gender && <p className="text-[10px] text-destructive">{primaryErrors.gender}</p>}
                      </div>

                      {/* City */}
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold flex items-center gap-1.5"><MapPin className="h-3 w-3 text-muted-foreground" /> City *</Label>
                        <Input placeholder="e.g. Mumbai" className="h-9 text-xs" value={primary.city}
                          onChange={e => setPrimary(p => ({ ...p, city: e.target.value }))} />
                        {primaryErrors.city && <p className="text-[10px] text-destructive">{primaryErrors.city}</p>}
                      </div>

                      {/* State */}
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">State</Label>
                        <Input placeholder="e.g. Maharashtra" className="h-9 text-xs" value={primary.state}
                          onChange={e => setPrimary(p => ({ ...p, state: e.target.value }))} />
                      </div>

                      {/* Country */}
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold flex items-center gap-1.5"><Globe className="h-3 w-3 text-muted-foreground" /> Country</Label>
                        <Input placeholder="e.g. India" className="h-9 text-xs" value={primary.country}
                          onChange={e => setPrimary(p => ({ ...p, country: e.target.value }))} />
                      </div>
                    </div>

                    {/* Additional Participants */}
                    {qty > 1 && (
                      <div className="space-y-4 pt-2">
                        <Separator />
                        <h3 className="font-bold text-sm text-foreground">Additional Participant Details</h3>
                        {additionals.map((p, i) => (
                          <div key={i} className="border border-border/40 rounded-xl p-4 space-y-3 bg-muted/10">
                            <div className="text-xs font-bold text-foreground flex items-center gap-2">
                              <div className="h-5 w-5 bg-primary/10 text-primary rounded-full flex items-center justify-center text-[10px] font-extrabold">{i + 2}</div>
                              Participant {i + 2}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <Label className="text-xs">Full Name</Label>
                                <Input placeholder="Full Name" className="h-8 text-xs" value={p.fullName}
                                  onChange={e => updateAdditional(i, "fullName", e.target.value)} />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">Email Address</Label>
                                <Input type="email" placeholder="Email" className="h-8 text-xs" value={p.email}
                                  onChange={e => updateAdditional(i, "email", e.target.value)} />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">Mobile Number</Label>
                                <Input type="tel" placeholder="+91 9876543210" className="h-8 text-xs" value={p.mobile}
                                  onChange={e => updateAdditional(i, "mobile", e.target.value)} />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">Age</Label>
                                <Input type="number" placeholder="Age" min="1" max="120" className="h-8 text-xs" value={p.age}
                                  onChange={e => updateAdditional(i, "age", e.target.value)} />
                              </div>
                              <div className="space-y-1 sm:col-span-2">
                                <Label className="text-xs">Gender</Label>
                                <select className="h-8 text-xs w-full border border-input rounded-md bg-background px-3 focus:outline-none"
                                  value={p.gender} onChange={e => updateAdditional(i, "gender", e.target.value)}>
                                  <option value="">Select Gender</option>
                                  <option value="male">Male</option>
                                  <option value="female">Female</option>
                                  <option value="non-binary">Non-binary</option>
                                  <option value="prefer-not-to-say">Prefer not to say</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ── STEP 2: Payment ── */}
                {step === 2 && (
                  <div className="space-y-5">
                    <div>
                      <h3 className="font-bold text-sm text-foreground mb-1">Payment Summary</h3>
                      <p className="text-[11px] text-muted-foreground">Review the final charges before payment.</p>
                    </div>

                    {/* Summary card */}
                    <div className="bg-muted/20 rounded-xl border p-4 space-y-2.5">
                      <SummaryRow label="Program Fee" value={`₹${summary.programFee.toFixed(2)}`} />
                      <SummaryRow label={`Participants (${qty})`} value={`× ${qty}`} />
                      <SummaryRow label="Platform Fee (2.5%)" value={`₹${summary.platformFee.toFixed(2)}`} />
                      <SummaryRow label="Taxes (GST 18%)" value={`₹${summary.taxes.toFixed(2)}`} />
                      <SummaryRow label="Discount" value={`- ₹0.00`} />
                      <Separator />
                      <SummaryRow label="Total Amount Payable" value={`₹${summary.total.toFixed(2)}`} bold accent />
                    </div>

                    {/* Payment Method */}
                    <div className="space-y-2">
                      <h4 className="font-bold text-xs text-foreground">Payment Method</h4>
                      <button
                        type="button"
                        onClick={handleRazorpayClick}
                        className="w-full flex items-center justify-between p-4 border-2 border-primary/40 bg-primary/5 rounded-xl hover:bg-primary/10 transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 bg-[#072654] rounded-lg flex items-center justify-center">
                            <CreditCard className="h-4 w-4 text-white" />
                          </div>
                          <div className="text-left">
                            <div className="text-sm font-bold text-foreground">Razorpay</div>
                            <div className="text-[10px] text-muted-foreground">Cards, UPI, Wallets & Net Banking</div>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                      </button>
                    </div>

                    {/* Terms & Conditions */}
                    <div className="space-y-3 pt-1">
                      <h4 className="font-bold text-xs text-foreground">Terms & Conditions</h4>
                      {[
                        { id: "terms", checked: termsAgreed, setter: setTermsAgreed, label: "I agree to the Terms and Conditions." },
                        { id: "cancellation", checked: cancellationAgreed, setter: setCancellationAgreed, label: "I agree to the Cancellation and Refund Policy." },
                        { id: "notifications", checked: notificationsAgreed, setter: setNotificationsAgreed, label: "I agree to receive booking-related notifications." },
                      ].map(({ id, checked, setter, label }) => (
                        <label key={id} className="flex items-start gap-2.5 cursor-pointer group">
                          <input type="checkbox" id={id} checked={checked} onChange={e => setter(e.target.checked)}
                            className="mt-0.5 h-4 w-4 shrink-0 rounded border border-border cursor-pointer" />
                          <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">{label}</span>
                        </label>
                      ))}
                    </div>

                    {!canProceedToConfirm && (
                      <div className="flex items-center gap-2 text-[11px] text-amber-600 bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-lg">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        Please accept Terms & Conditions and Refund Policy to proceed.
                      </div>
                    )}
                  </div>
                )}

                {/* ── STEP 3: Confirm ── */}
                {step === 3 && (
                  <div className="space-y-5">
                    <div>
                      <h3 className="font-bold text-sm text-foreground mb-1">Booking Confirmation</h3>
                      <p className="text-[11px] text-muted-foreground">Review your details before submitting.</p>
                    </div>

                    {/* Workshop */}
                    <div className="bg-muted/20 rounded-xl border p-4 space-y-2.5">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Workshop</div>
                      <div className="font-bold text-sm text-foreground">{program.title}</div>
                      <div className="grid grid-cols-2 gap-1.5 text-[11px] text-muted-foreground">
                        <span>📅 {program.date}</span>
                        <span>⏰ {program.time}</span>
                        <span>⏱ {program.duration}</span>
                        <span>📍 {program.location.split(",")[0]}</span>
                      </div>
                    </div>

                    {/* Primary Participant */}
                    <div className="bg-muted/20 rounded-xl border p-4 space-y-2">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Primary Participant</div>
                      <div className="grid grid-cols-2 gap-1 text-[11px]">
                        <span className="text-muted-foreground">Name</span><span className="font-semibold text-foreground">{primary.fullName || "—"}</span>
                        <span className="text-muted-foreground">Email</span><span className="font-semibold text-foreground truncate">{primary.email || "—"}</span>
                        <span className="text-muted-foreground">Mobile</span><span className="font-semibold text-foreground">{primary.mobile || "—"}</span>
                        <span className="text-muted-foreground">City</span><span className="font-semibold text-foreground">{primary.city || "—"}, {primary.country}</span>
                      </div>
                    </div>

                    {/* Payment */}
                    <div className="bg-muted/20 rounded-xl border p-4 space-y-2.5">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Payment</div>
                      <SummaryRow label={`${qty} Seat${qty > 1 ? "s" : ""} × ₹${program.price}`} value={`₹${summary.programFee.toFixed(2)}`} />
                      <SummaryRow label="Fees & Taxes" value={`₹${(summary.platformFee + summary.taxes).toFixed(2)}`} />
                      <Separator />
                      <SummaryRow label="Total" value={`₹${summary.total.toFixed(2)}`} bold accent />
                      <div className="text-[10px] text-muted-foreground pt-1">via <span className="font-semibold text-foreground">Razorpay</span></div>
                    </div>

                    {/* Status Flow */}
                    <div className="text-[10px] text-muted-foreground bg-muted/20 border rounded-xl p-3 leading-relaxed">
                      <span className="font-bold text-foreground">Booking Status Flow: </span>
                      Pending Payment → Payment Successful → <span className="text-emerald-500 font-bold">Booking Confirmed</span> → Program Started → Program Completed
                    </div>
                  </div>
                )}

              </div>

              {/* Footer Navigation */}
              <div className="px-6 py-4 border-t border-border/30 shrink-0 flex justify-between items-center gap-3">
                <Button variant="outline" onClick={handleBack} disabled={step === 0 || paymentLoading}
                  className="h-10 rounded-xl text-xs font-semibold">
                  <ChevronLeft className="h-4 w-4 mr-1" /> Back
                </Button>

                <div className="text-xs text-muted-foreground font-semibold">
                  Step {step + 1} of {STEPS.length}
                </div>

                {step < STEPS.length - 1 ? (
                  <Button onClick={handleNext} className="h-10 rounded-xl text-xs font-semibold px-6"
                    disabled={step === 2 && !canProceedToConfirm}>
                    Next <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                ) : (
                  <Button onClick={handleRazorpayClick} disabled={paymentLoading || !canProceedToConfirm}
                    className="h-10 rounded-xl text-xs font-bold px-6 bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20">
                    {paymentLoading ? <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> Processing...</> : <>Book Now — ₹{summary.total.toFixed(2)}</>}
                  </Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ─── Razorpay Mock Alert ─────────────────────────────────────────────── */}
      <Dialog open={razorpayAlert} onOpenChange={setRazorpayAlert}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="h-8 w-8 bg-[#072654] rounded-lg flex items-center justify-center">
                <CreditCard className="h-4 w-4 text-white" />
              </div>
              Razorpay Payment
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground pt-1">
              Razorpay integration is coming soon. Simulate a payment result for testing:
            </DialogDescription>
          </DialogHeader>

          <div className="bg-muted/30 rounded-xl border p-4 space-y-1.5 text-xs">
            <div className="flex justify-between"><span className="text-muted-foreground">Amount</span><span className="font-bold text-foreground">₹{summary.total.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Program</span><span className="font-semibold text-foreground max-w-[180px] truncate">{program.title}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Seats</span><span className="font-semibold text-foreground">{qty}</span></div>
          </div>

          <div className="flex gap-2 pt-1">
            <Button variant="outline" onClick={() => setRazorpayAlert(false)}
              className="flex-1 h-10 rounded-xl text-xs border-destructive/30 text-destructive hover:bg-destructive/5">
              <X className="h-4 w-4 mr-1.5" /> Decline
            </Button>
            <Button onClick={handleFakePaymentApprove} disabled={paymentLoading}
              className="flex-1 h-10 rounded-xl text-xs bg-emerald-600 hover:bg-emerald-700">
              {paymentLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><CheckCircle2 className="h-4 w-4 mr-1.5" /> Approve</>}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
