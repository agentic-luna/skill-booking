"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { User, Lock, ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { useAuthStore } from "@/features/auth/store/authStore";
import { sendOtp } from "@/features/auth/api/otp.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import OtpStep from "./_components/OtpStep";

import PhoneInputWithCountry from "@/components/common/PhoneInputWithCountry";
import PasswordStrengthMeter from "@/components/common/PasswordStrengthMeter";
import { clientSignupZodSchema } from "@/lib/validation/authValidation";
import { useClientEmailModalStore } from "@/features/auth/store/clientEmailModalStore";

type ClientInfoFormValues = z.infer<typeof clientSignupZodSchema>;

export default function RegisterPage() {
  const router = useRouter();

  const { clientSendOtp, clientSignup, isLoading, error, clearError } = useAuthStore();

  // Client state
  const [clientStep, setClientStep] = useState<0 | 1>(0);
  const [clientPasswordValue, setClientPasswordValue] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [clientPendingData, setClientPendingData] = useState<ClientInfoFormValues | null>(null);
  const [clientDevOtp, setClientDevOtp] = useState<string | undefined>(undefined);

  const { register: registerClient, handleSubmit: handleSubmitClient, setValue: setValueClient, watch: watchClient, formState: { errors: errorsClient } } = useForm<ClientInfoFormValues>({
    resolver: zodResolver(clientSignupZodSchema),
    defaultValues: { firstName: "", lastName: "", phone: "+91", password: "" },
  });

  const onClientInfoSubmit = async (data: ClientInfoFormValues) => {
    if (data.password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      return;
    }
    setConfirmPasswordError("");

    try {
      const res = await clientSendOtp(data.phone);
      setClientDevOtp(res?.data?.devOtp || res?.devOtp);
      setClientPendingData(data);
      setClientStep(1);
    } catch { /* error set in store */ }
  };

  const onClientPhoneOtpSubmit = async (otp: string) => {
    if (!clientPendingData) return;
    try {
      await clientSignup({
        ...clientPendingData,
        otp: otp.trim(),
      });
      router.push("/");
      useClientEmailModalStore.getState().openModal();
    } catch { /* error set in store */ }
  };

  return (
    <div className="space-y-4">
      <div className="mt-0 space-y-5">
        {clientStep === 0 && (
          <div className="space-y-5">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">Create a Learner Account</h2>
              <p className="text-sm text-muted-foreground">Sign up with your WhatsApp number to start booking live training.</p>
            </div>

            <form onSubmit={handleSubmitClient(onClientInfoSubmit)} className="space-y-4">
              {error && <div className="p-3 text-xs font-semibold text-red-600 dark:text-red-400 bg-red-500/10 rounded-xl border border-red-500/30 animate-pulse">{error}</div>}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="c-firstName">First Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="c-firstName" placeholder="John" className="pl-10" {...registerClient("firstName")} disabled={isLoading} />
                  </div>
                  {errorsClient.firstName && <p className="text-xs text-destructive">{errorsClient.firstName.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="c-lastName">Last Name</Label>
                  <Input id="c-lastName" placeholder="Doe" {...registerClient("lastName")} disabled={isLoading} />
                  {errorsClient.lastName && <p className="text-xs text-destructive">{errorsClient.lastName.message}</p>}
                </div>
              </div>

              <PhoneInputWithCountry
                id="c-phone"
                value={watchClient("phone") || "+91"}
                onChange={(val) => setValueClient("phone", val, { shouldValidate: true })}
                disabled={isLoading}
                label="WhatsApp Number (with Country Code)"
                isWhatsApp={true}
              />
              {errorsClient.phone && <p className="text-xs text-red-500 font-semibold">{errorsClient.phone.message}</p>}

              <div className="space-y-1.5">
                <Label htmlFor="c-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="c-password"
                    placeholder="••••••••"
                    type="password"
                    className="pl-10 pr-10"
                    {...registerClient("password")}
                    onChange={(e) => {
                      registerClient("password").onChange(e);
                      setClientPasswordValue(e.target.value);
                    }}
                    disabled={isLoading}
                  />
                </div>
                {errorsClient.password && <p className="text-xs text-red-500 font-semibold">{errorsClient.password.message}</p>}
                <PasswordStrengthMeter password={clientPasswordValue} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="c-confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="c-confirmPassword"
                    placeholder="••••••••"
                    type="password"
                    className="pl-10"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                {confirmPasswordError && <p className="text-xs text-red-500 font-semibold">{confirmPasswordError}</p>}
              </div>

              <Button type="submit" className="w-full font-bold h-11 rounded-xl" disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ArrowRight className="h-4 w-4 mr-2" />}
                {isLoading ? "Sending verification code..." : "Continue"}
              </Button>
            </form>
            <div className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-primary hover:underline">Sign in</Link>
            </div>
          </div>
        )}

        {clientStep === 1 && (
          <>
            <button type="button" onClick={() => { clearError(); setClientStep(0); }} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2">
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <OtpStep
              idPrefix="client-reg-phone-otp"
              title="Verify your WhatsApp"
              description={`We sent a 6-digit code to ${clientPendingData?.phone ?? "your phone"}`}
              isLoading={isLoading}
              error={error}
              devOtp={clientDevOtp}
              onSubmit={onClientPhoneOtpSubmit}
              onResend={async () => {
                if (clientPendingData) {
                  try {
                    const res = await clientSendOtp(clientPendingData.phone);
                    setClientDevOtp(res?.data?.devOtp || res?.devOtp);
                  } catch { }
                }
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}
