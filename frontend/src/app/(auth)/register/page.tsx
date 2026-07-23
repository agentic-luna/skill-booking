"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Mail, User, Lock, Check, Users, Phone, ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { useAuthStore } from "@/features/auth/store/authStore";
import { sendOtp } from "@/features/auth/api/otp.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import StepIndicator from "./_components/StepIndicator";
import OtpStep from "./_components/OtpStep";

import PhoneInputWithCountry from "@/components/common/PhoneInputWithCountry";
import PasswordStrengthMeter from "@/components/common/PasswordStrengthMeter";
import { hostSignupZodSchema } from "@/lib/validation/authValidation";

type InfoFormValues = z.infer<typeof hostSignupZodSchema> & { role?: "host" };

export default function RegisterPage() {
  const router = useRouter();
  const { startRegistration, verifyEmailOtp, verifyPhoneOtpAndSignup, pendingRegistration, isLoading, error, clearError } = useAuthStore();
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [passwordValue, setPasswordValue] = useState("");

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<InfoFormValues>({
    resolver: zodResolver(hostSignupZodSchema),
    defaultValues: { firstName: "", lastName: "", email: "", phone: "+91", password: "" },
  });

  const onInfoSubmit = async (data: InfoFormValues) => {
    try { await startRegistration({ ...data, role: "host" }); setStep(1); } catch { /* error set in store */ }
  };

  const onEmailOtpSubmit = async (otp: string) => {
    try { await verifyEmailOtp(otp); setStep(2); } catch { /* error set in store */ }
  };

  const onPhoneOtpSubmit = async (otp: string) => {
    try {
      const user = await verifyPhoneOtpAndSignup(otp);
      router.push(user.role === "host" ? "/host/dashboard" : "/");
    } catch { /* error set in store */ }
  };

  return (
    <div className="space-y-4">
      <StepIndicator current={step} />

      {step === 0 && (
        <div className="space-y-5">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Create a Host Account</h2>
            <p className="text-sm text-muted-foreground">Register as an instructor/host to create and host workshops</p>
          </div>

          <form onSubmit={handleSubmit(onInfoSubmit)} className="space-y-4">
            {error && <div className="p-3 text-xs font-semibold text-red-600 dark:text-red-400 bg-red-500/10 rounded-xl border border-red-500/30 animate-pulse">{error}</div>}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="firstName">First Name</Label>
                <div className="relative"><User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input id="firstName" placeholder="John" className="pl-10" {...register("firstName")} disabled={isLoading} /></div>
                {errors.firstName && <p className="text-xs text-destructive">{errors.firstName.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" placeholder="Doe" {...register("lastName")} disabled={isLoading} />
                {errors.lastName && <p className="text-xs text-destructive">{errors.lastName.message}</p>}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative"><Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input id="email" placeholder="name@example.com" type="email" className="pl-10" {...register("email")} disabled={isLoading} /></div>
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <PhoneInputWithCountry
              id="phone"
              value={watch("phone") || "+91"}
              onChange={(val) => setValue("phone", val, { shouldValidate: true })}
              disabled={isLoading}
              label="Phone Number (with Country Code)"
              isWhatsApp={false}
            />
            {errors.phone && <p className="text-xs text-red-500 font-semibold">{errors.phone.message}</p>}

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="password" 
                  placeholder="••••••••" 
                  type="password" 
                  className="pl-10" 
                  {...register("password")} 
                  onChange={(e) => {
                    register("password").onChange(e);
                    setPasswordValue(e.target.value);
                  }}
                  disabled={isLoading} 
                />
              </div>
              {errors.password && <p className="text-xs text-red-500 font-semibold">{errors.password.message}</p>}
              <PasswordStrengthMeter password={passwordValue} />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ArrowRight className="h-4 w-4 mr-2" />}
              {isLoading ? "Sending verification codes..." : "Continue"}
            </Button>
          </form>
          <div className="text-center text-sm text-muted-foreground">Already have an account?{" "}<Link href="/login" className="font-semibold text-primary hover:underline">Sign in</Link></div>
        </div>
      )}

      {step === 1 && (
        <>
          <button type="button" onClick={() => { clearError(); setStep(0); }} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <OtpStep idPrefix="reg-email-otp" title="Verify your email" description={`We sent a 6-digit code to ${pendingRegistration?.email ?? "your email"}`} isLoading={isLoading} error={error} onSubmit={onEmailOtpSubmit} onResend={() => pendingRegistration && sendOtp(pendingRegistration.email, "EMAIL").catch(() => {})} />
        </>
      )}

      {step === 2 && (
        <>
          <button type="button" onClick={() => { clearError(); setStep(1); }} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <OtpStep idPrefix="reg-phone-otp" title="Verify your phone" description={`We sent a 6-digit code to ${pendingRegistration?.phone ?? "your phone"}`} isLoading={isLoading} error={error} onSubmit={onPhoneOtpSubmit} onResend={() => pendingRegistration && sendOtp(pendingRegistration.phone, "PHONE").catch(() => {})} />
        </>
      )}
    </div>
  );
}
