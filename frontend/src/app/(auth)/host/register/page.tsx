"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mail, User, Lock, Users, ArrowLeft, ArrowRight, 
  Loader2, AlertTriangle, CheckCircle, ShieldCheck, Sparkles, Check 
} from "lucide-react";
import { useAuthStore } from "@/features/auth/store/authStore";
import { sendOtp } from "@/features/auth/api/otp.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import OtpStep from "../../register/_components/OtpStep";

import PhoneInputWithCountry from "@/components/common/PhoneInputWithCountry";
import PasswordStrengthMeter from "@/components/common/PasswordStrengthMeter";
import { isValidE164Phone, EMAIL_REGEX } from "@/lib/validation/authValidation";

export default function HostRegisterPage() {
  const router = useRouter();
  const { startRegistration, verifyEmailOtp, verifyPhoneOtpAndSignup, pendingRegistration, isLoading, error, clearError } = useAuthStore();

  // Wizard screens:
  // 0: Identity (First/Last name)
  // 1: Contact (Email/Phone)
  // 2: Security (Password & Confirm Password)
  // 3: Email OTP Verification
  // 4: Phone OTP Verification
  const [step, setStep] = useState<0 | 1 | 2 | 3 | 4>(0);

  // Form states
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("+91");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Validation errors
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});

  // OTP Verification state
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  // Identity Submission
  const handleIdentityNext = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!firstName.trim()) errs.firstName = "First name is required";
    if (!lastName.trim()) errs.lastName = "Last name is required";
    
    if (Object.keys(errs).length > 0) {
      setLocalErrors(errs);
      return;
    }
    setLocalErrors({});
    clearError();
    setStep(1);
  };

  // Contact Submission
  const handleContactNext = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      errs.email = "Email is required";
    } else if (!EMAIL_REGEX.test(cleanEmail)) {
      errs.email = "Please enter a valid email address";
    }
    if (!isValidE164Phone(phone)) {
      errs.phone = "Please enter a valid phone number (e.g. +91 94882 52540)";
    }

    if (Object.keys(errs).length > 0) {
      setLocalErrors(errs);
      return;
    }
    setLocalErrors({});
    clearError();
    setStep(2);
  };

  // Password Submission & Onboarding Trigger
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (password.length < 6) {
      errs.password = "Password must be at least 6 characters long";
    }
    if (password !== confirmPassword) {
      errs.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(errs).length > 0) {
      setLocalErrors(errs);
      return;
    }
    setLocalErrors({});
    clearError();

    try {
      const cleanEmail = email.trim().toLowerCase();
      await startRegistration({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: cleanEmail,
        phone,
        password,
        role: "host"
      });
      setStep(3);
    } catch {
      // Store catches error and displays it
    }
  };

  // Verify Email OTP
  const onHostEmailOtpSubmit = async (otp: string) => {
    setVerifyingOtp(true);
    try {
      await verifyEmailOtp(otp);
      setStep(4);
    } catch {
      // Error is caught in store
    } finally {
      setVerifyingOtp(false);
    }
  };

  // Verify Phone OTP & Complete Signup
  const onHostPhoneOtpSubmit = async (otp: string) => {
    setVerifyingOtp(true);
    try {
      const user = await verifyPhoneOtpAndSignup(otp);
      router.push(user.role === "host" ? "/host/dashboard" : "/");
    } catch {
      // Error is caught in store
    } finally {
      setVerifyingOtp(false);
    }
  };

  // Custom step indicators
  const stepTitles = ["Identity", "Contact", "Security", "Verify Email", "Verify Phone"];

  return (
    <div className="space-y-6">
      {/* Premium Step Tracker */}
      <div className="w-full py-2">
        <div className="flex items-center justify-between relative">
          {/* Progress bar background line */}
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-gray-200 dark:bg-white/10 z-0" />
          {/* Active progress bar line */}
          <motion.div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-emerald-500 z-0"
            initial={{ width: "0%" }}
            animate={{ width: `${(step / 4) * 100}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />

          {stepTitles.map((title, idx) => {
            const isCompleted = step > idx;
            const isActive = step === idx;

            return (
              <div key={title} className="flex flex-col items-center relative z-10">
                <motion.div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    isCompleted 
                      ? "bg-emerald-500 text-white" 
                      : isActive 
                        ? "bg-[#0d1e17] border-2 border-[#a0f212] text-[#a0f212] shadow-sm shadow-[#a0f212]/30" 
                        : "bg-white border border-gray-300 text-gray-400"
                  }`}
                  animate={isActive ? { scale: [1, 1.05, 1] } : {}}
                  transition={{ duration: 0.5, repeat: isActive ? Infinity : 0, repeatDelay: 3 }}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" strokeWidth={3} />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </motion.div>

                {/* Label - visible on desktop, hidden/compact on mobile */}
                <span className={`hidden md:block mt-2 text-[10px] font-extrabold uppercase tracking-wider transition-colors duration-300 ${isActive ? "text-gray-900" : isCompleted ? "text-emerald-600" : "text-gray-400"}`}>
                  {title}
                </span>
              </div>
            );
          })}
        </div>

        {/* Mobile current step label display */}
        <div className="md:hidden text-center mt-3">
          <span className="text-xs font-bold text-gray-500">
            Step {step + 1} of 5: <span className="text-emerald-600 font-black">{stepTitles[step]}</span>
          </span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* Identity Step */}
        {step === 0 && (
          <motion.form
            key="step-identity"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onSubmit={handleIdentityNext}
            className="space-y-5"
          >
            <div className="space-y-1">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">Tell us about yourself</h2>
              <p className="text-sm text-muted-foreground">Welcome! Enter your full name to start listing your training courses.</p>
            </div>

            {error && <div className="p-3 text-xs font-semibold text-red-600 dark:text-red-400 bg-red-500/10 rounded-xl border border-red-500/30 animate-pulse">{error}</div>}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="firstName">First Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="firstName" 
                    placeholder="John" 
                    className="pl-10" 
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    disabled={isLoading} 
                  />
                </div>
                {localErrors.firstName && <p className="text-xs text-destructive font-semibold">{localErrors.firstName}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName">Last Name</Label>
                <Input 
                  id="lastName" 
                  placeholder="Doe" 
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={isLoading} 
                />
                {localErrors.lastName && <p className="text-xs text-destructive font-semibold">{localErrors.lastName}</p>}
              </div>
            </div>

            <Button type="submit" className="w-full font-bold h-11 rounded-xl" disabled={isLoading}>
              Next: Contact Details <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </motion.form>
        )}

        {/* Contact Step */}
        {step === 1 && (
          <motion.form
            key="step-contact"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onSubmit={handleContactNext}
            className="space-y-5"
          >
            <button 
              type="button" 
              onClick={() => setStep(0)} 
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-bold"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </button>

            <div className="space-y-1">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">How can we reach you?</h2>
              <p className="text-sm text-muted-foreground">E-mail and phone numbers are verified securely prior to onboarding.</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="email" 
                  placeholder="host@example.com" 
                  type="email" 
                  className="pl-10" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading} 
                />
              </div>
              {localErrors.email && <p className="text-xs text-destructive font-semibold">{localErrors.email}</p>}
            </div>

            <PhoneInputWithCountry
              id="phone"
              value={phone}
              onChange={(val) => setPhone(val)}
              disabled={isLoading}
              label="WhatsApp Phone Number (with Country Code)"
              isWhatsApp={false}
            />
            {localErrors.phone && <p className="text-xs text-destructive font-semibold">{localErrors.phone}</p>}

            <Button type="submit" className="w-full font-bold h-11 rounded-xl" disabled={isLoading}>
              Next: Secure Account <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </motion.form>
        )}

        {/* Security Step */}
        {step === 2 && (
          <motion.form
            key="step-security"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onSubmit={handleRegisterSubmit}
            className="space-y-5"
          >
            <button 
              type="button" 
              onClick={() => setStep(1)} 
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-bold"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </button>

            <div className="space-y-1">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">Secure your account</h2>
              <p className="text-sm text-muted-foreground">Select a password to protect your payouts, stats, and course details.</p>
            </div>

            {error && <div className="p-3 text-xs font-semibold text-red-600 dark:text-red-400 bg-red-500/10 rounded-xl border border-red-500/30 animate-pulse">{error}</div>}

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  placeholder="••••••••"
                  type="password"
                  className="pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              {localErrors.password && <p className="text-xs text-destructive font-semibold">{localErrors.password}</p>}
              <PasswordStrengthMeter password={password} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  placeholder="••••••••"
                  type="password"
                  className="pl-10"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              {localErrors.confirmPassword && <p className="text-xs text-destructive font-semibold">{localErrors.confirmPassword}</p>}
            </div>

            <Button type="submit" className="w-full font-bold h-11 rounded-xl" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
              {isLoading ? "Starting Onboarding..." : "Register & Send OTPs"}
            </Button>
          </motion.form>
        )}

        {/* Email OTP Step */}
        {step === 3 && (
          <motion.div
            key="step-email-otp"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-5"
          >
            {/* Critical Stay on Page Alert */}
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex gap-3 shadow-xs">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 animate-bounce" />
              <div className="space-y-1">
                <p className="font-bold">Important: Do not close or refresh this page!</p>
                <p className="text-amber-700/80 font-medium">We are currently verifying your details. Navigating away or reloading now will abort your trainer application session.</p>
              </div>
            </div>

            {/* Nice pulsing check animation during OTP verification */}
            {verifyingOtp && (
              <div className="flex justify-center py-4">
                <div className="relative flex items-center justify-center">
                  <div className="absolute animate-ping h-12 w-12 rounded-full bg-emerald-500/30 opacity-75" />
                  <div className="relative rounded-full h-12 w-12 bg-emerald-500/10 border border-emerald-500 flex items-center justify-center text-emerald-600">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                </div>
              </div>
            )}

            <OtpStep
              idPrefix="reg-email-otp"
              title="Verify trainer email"
              description={`To finalize listing rights, verify the email OTP sent to ${email}`}
              isLoading={isLoading}
              error={error}
              devOtp={pendingRegistration?.devEmailOtp}
              onSubmit={onHostEmailOtpSubmit}
              onResend={async () => {
                if (pendingRegistration) {
                  try {
                    const res = await sendOtp(pendingRegistration.email, "EMAIL");
                    useAuthStore.setState((s) => ({
                      pendingRegistration: s.pendingRegistration
                        ? { ...s.pendingRegistration, devEmailOtp: (res as any).data?.devOtp || res.devOtp }
                        : null
                    }));
                  } catch { }
                }
              }}
            />
          </motion.div>
        )}

        {/* Phone OTP Step */}
        {step === 4 && (
          <motion.div
            key="step-phone-otp"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-5"
          >
            {/* Critical Stay on Page Alert */}
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex gap-3 shadow-xs">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 animate-bounce" />
              <div className="space-y-1">
                <p className="font-bold">Almost there: Please stay on this screen!</p>
                <p className="text-amber-700/80 font-medium">One final verification step left. Do not exit, click back, or reload the window.</p>
              </div>
            </div>

            {/* Nice pulsing check animation during OTP verification */}
            {verifyingOtp && (
              <div className="flex justify-center py-4">
                <div className="relative flex items-center justify-center">
                  <div className="absolute animate-ping h-12 w-12 rounded-full bg-emerald-500/30 opacity-75" />
                  <div className="relative rounded-full h-12 w-12 bg-emerald-500/10 border border-emerald-500 flex items-center justify-center text-emerald-600">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                </div>
              </div>
            )}

            <OtpStep
              idPrefix="reg-phone-otp"
              title="Verify trainer WhatsApp"
              description={`Verify the 6-digit confirmation code delivered to ${phone}`}
              isLoading={isLoading}
              error={error}
              devOtp={pendingRegistration?.devPhoneOtp}
              onSubmit={onHostPhoneOtpSubmit}
              onResend={async () => {
                if (pendingRegistration) {
                  try {
                    const res = await sendOtp(pendingRegistration.phone, "PHONE");
                    useAuthStore.setState((s) => ({
                      pendingRegistration: s.pendingRegistration
                        ? { ...s.pendingRegistration, devPhoneOtp: (res as any).data?.devOtp || res.devOtp }
                        : null
                    }));
                  } catch { }
                }
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
