"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Mail, User, Lock, Check, Users, Phone, ArrowLeft, ArrowRight, Loader2, Sparkles, CheckCircle2, ShieldCheck, GraduationCap } from "lucide-react";
import { useAuthStore } from "@/features/auth/store/authStore";
import { sendOtp } from "@/features/auth/api/otp.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import StepIndicator from "./_components/StepIndicator";
import OtpStep from "./_components/OtpStep";

import PhoneInputWithCountry from "@/components/common/PhoneInputWithCountry";
import PasswordStrengthMeter from "@/components/common/PasswordStrengthMeter";
import { hostSignupZodSchema, clientSignupZodSchema } from "@/lib/validation/authValidation";
import { useClientEmailModalStore } from "@/features/auth/store/clientEmailModalStore";

type HostInfoFormValues = z.infer<typeof hostSignupZodSchema> & { role?: "host" };
type ClientInfoFormValues = z.infer<typeof clientSignupZodSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("role") === "host" ? "host" : "client";
  const [activeTab, setActiveTab] = useState<"client" | "host">(defaultTab);

  const { startRegistration, verifyEmailOtp, verifyPhoneOtpAndSignup, clientSendOtp, clientSignup, pendingRegistration, isLoading, error, clearError } = useAuthStore();

  // Host state
  const [hostStep, setHostStep] = useState<0 | 1 | 2>(0);
  const [hostPasswordValue, setHostPasswordValue] = useState("");

  // Client state
  const [clientStep, setClientStep] = useState<0 | 1>(0);
  const [clientPasswordValue, setClientPasswordValue] = useState("");
  const [clientPendingData, setClientPendingData] = useState<ClientInfoFormValues | null>(null);
  const [clientDevOtp, setClientDevOtp] = useState<string | undefined>(undefined);

  // Forms
  const { register: registerHost, handleSubmit: handleSubmitHost, setValue: setValueHost, watch: watchHost, formState: { errors: errorsHost } } = useForm<HostInfoFormValues>({
    resolver: zodResolver(hostSignupZodSchema),
    defaultValues: { firstName: "", lastName: "", email: "", phone: "+91", password: "" },
  });

  const { register: registerClient, handleSubmit: handleSubmitClient, setValue: setValueClient, watch: watchClient, formState: { errors: errorsClient } } = useForm<ClientInfoFormValues>({
    resolver: zodResolver(clientSignupZodSchema),
    defaultValues: { firstName: "", lastName: "", phone: "+91", password: "" },
  });

  // --- HOST HANDLERS ---
  const onHostInfoSubmit = async (data: HostInfoFormValues) => {
    try {
      await startRegistration({ ...data, role: "host" });
      // DEV: devEmailOtp / devPhoneOtp are now stored in pendingRegistration by the store
      setHostEmailDevOtp(useAuthStore.getState().pendingRegistration?.devEmailOtp);
      setHostPhoneDevOtp(useAuthStore.getState().pendingRegistration?.devPhoneOtp);
      setHostStep(1);
    } catch { /* error set in store */ }
  };
  const onHostEmailOtpSubmit = async (otp: string) => {
    try { await verifyEmailOtp(otp); setHostStep(2); } catch { /* error set in store */ }
  };
  const onHostPhoneOtpSubmit = async (otp: string) => {
    try {
      const user = await verifyPhoneOtpAndSignup(otp);
      router.push(user.role === "host" ? "/host/dashboard" : "/");
    } catch { /* error set in store */ }
  };

  // --- CLIENT HANDLERS ---
  const onClientInfoSubmit = async (data: ClientInfoFormValues) => {
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
      // Auto open email magic link verification popup
      useClientEmailModalStore.getState().openModal();
    } catch { /* error set in store */ }
  };

  const handleTabChange = (val: string) => {
    setActiveTab(val as "client" | "host");
    clearError();
  };

  return (
    <div className="space-y-4">
      {activeTab === "host" && <StepIndicator current={hostStep} />}

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        {hostStep === 0 && clientStep === 0 && (
          <TabsList className="grid grid-cols-2 w-full mb-6 bg-muted/60 p-1 rounded-xl">
            <TabsTrigger value="client" className="flex items-center justify-center gap-2 rounded-lg text-sm font-semibold py-2 data-[state=active]:border data-[state=active]:border-border/50">
              <GraduationCap className="h-4 w-4" /> Learner
            </TabsTrigger>
            <TabsTrigger value="host" className="flex items-center justify-center gap-2 rounded-lg text-sm font-semibold py-2 data-[state=active]:border data-[state=active]:border-border/50">
              <Users className="h-4 w-4" /> Host
            </TabsTrigger>
          </TabsList>
        )}

        {/* ── CLIENT TAB ── */}
        <TabsContent value="client" className="mt-0 space-y-5">
          {clientStep === 0 && (
            <div className="space-y-5">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">Create a Learner Account</h2>
                <p className="text-sm text-muted-foreground">Sign up with your WhatsApp number to start booking live skill training.</p>
              </div>

              <form onSubmit={handleSubmitClient(onClientInfoSubmit)} className="space-y-4">
                {error && <div className="p-3 text-xs font-semibold text-red-600 dark:text-red-400 bg-red-500/10 rounded-xl border border-red-500/30 animate-pulse">{error}</div>}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="c-firstName">First Name</Label>
                    <div className="relative"><User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input id="c-firstName" placeholder="John" className="pl-10" {...registerClient("firstName")} disabled={isLoading} /></div>
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
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ArrowRight className="h-4 w-4 mr-2" />}
                  {isLoading ? "Sending verification code..." : "Continue"}
                </Button>
              </form>
              <div className="text-center text-sm text-muted-foreground">Already have an account?{" "}<Link href="/login" className="font-semibold text-primary hover:underline">Sign in</Link></div>
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
        </TabsContent>

        {/* ── HOST TAB ── */}
        <TabsContent value="host" className="mt-0 space-y-5">
          {hostStep === 0 && (
            <div className="space-y-5">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">Create a Host Account</h2>
                <p className="text-sm text-muted-foreground">Register as an instructor/host to create and host workshops</p>
              </div>

              <form onSubmit={handleSubmitHost(onHostInfoSubmit)} className="space-y-4">
                {error && <div className="p-3 text-xs font-semibold text-red-600 dark:text-red-400 bg-red-500/10 rounded-xl border border-red-500/30 animate-pulse">{error}</div>}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="firstName">First Name</Label>
                    <div className="relative"><User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input id="firstName" placeholder="John" className="pl-10" {...registerHost("firstName")} disabled={isLoading} /></div>
                    {errorsHost.firstName && <p className="text-xs text-destructive">{errorsHost.firstName.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" placeholder="Doe" {...registerHost("lastName")} disabled={isLoading} />
                    {errorsHost.lastName && <p className="text-xs text-destructive">{errorsHost.lastName.message}</p>}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative"><Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input id="email" placeholder="name@example.com" type="email" className="pl-10" {...registerHost("email")} disabled={isLoading} /></div>
                  {errorsHost.email && <p className="text-xs text-destructive">{errorsHost.email.message}</p>}
                </div>
                <PhoneInputWithCountry
                  id="phone"
                  value={watchHost("phone") || "+91"}
                  onChange={(val) => setValueHost("phone", val, { shouldValidate: true })}
                  disabled={isLoading}
                  label="Phone Number (with Country Code)"
                  isWhatsApp={false}
                />
                {errorsHost.phone && <p className="text-xs text-red-500 font-semibold">{errorsHost.phone.message}</p>}

                <div className="space-y-1.5">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      placeholder="••••••••"
                      type="password"
                      className="pl-10 pr-10"
                      {...registerHost("password")}
                      onChange={(e) => {
                        registerHost("password").onChange(e);
                        setHostPasswordValue(e.target.value);
                      }}
                      disabled={isLoading}
                    />
                  </div>
                  {errorsHost.password && <p className="text-xs text-red-500 font-semibold">{errorsHost.password.message}</p>}
                  <PasswordStrengthMeter password={hostPasswordValue} />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ArrowRight className="h-4 w-4 mr-2" />}
                  {isLoading ? "Sending verification codes..." : "Continue"}
                </Button>
              </form>
              <div className="text-center text-sm text-muted-foreground">Already have an account?{" "}<Link href="/login" className="font-semibold text-primary hover:underline">Sign in</Link></div>
            </div>
          )}

          {hostStep === 1 && (
            <>
              <button type="button" onClick={() => { clearError(); setHostStep(0); }} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2">
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <OtpStep
                idPrefix="reg-email-otp"
                title="Verify your email"
                description={`We sent a 6-digit code to ${pendingRegistration?.email ?? "your email"}`}
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
            </>
          )}

          {hostStep === 2 && (
            <>
              <button type="button" onClick={() => { clearError(); setHostStep(1); }} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2">
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <OtpStep
                idPrefix="reg-phone-otp"
                title="Verify your phone"
                description={`We sent a 6-digit code to ${pendingRegistration?.phone ?? "your phone"}`}
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
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
