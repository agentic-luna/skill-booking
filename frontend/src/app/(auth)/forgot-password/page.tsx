"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Mail, ArrowLeft, Send, Lock, Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";
import { useAuthStore } from "@/features/auth/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Step = "send" | "otp" | "reset" | "done";

const sendSchema = z.object({ identifier: z.string().min(3, "Enter a valid email or phone number") });
type SendForm = z.infer<typeof sendSchema>;

const resetSchema = z.object({
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Please confirm your password"),
}).refine((d) => d.newPassword === d.confirmPassword, { message: "Passwords do not match", path: ["confirmPassword"] });
type ResetForm = z.infer<typeof resetSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { forgotPassword, forgotPasswordVerifyOtp, resetPassword, isLoading, error, clearError } = useAuthStore();

  const [step, setStep] = useState<Step>("send");
  const [identifier, setIdentifier] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(6).fill(""));
  const [otpError, setOtpError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const sendForm = useForm<SendForm>({ resolver: zodResolver(sendSchema), defaultValues: { identifier: "" } });
  const resetForm = useForm<ResetForm>({ resolver: zodResolver(resetSchema), defaultValues: { newPassword: "", confirmPassword: "" } });

  const onSendSubmit = async (data: SendForm) => {
    try { await forgotPassword(data.identifier); setIdentifier(data.identifier); setStep("otp"); } catch { /* error in store */ }
  };

  const handleOtpChange = (index: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otpDigits]; next[index] = val; setOtpDigits(next); setOtpError(null); clearError();
    if (val && index < 5) document.getElementById(`fp-otp-${index + 1}`)?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      const next = [...otpDigits]; next[index] = ""; setOtpDigits(next);
      if (index > 0) document.getElementById(`fp-otp-${index - 1}`)?.focus();
    }
  };

  const onOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); const otp = otpDigits.join(""); if (otp.length < 6) return;
    try { const token = await forgotPasswordVerifyOtp(identifier, otp); setResetToken(token); setStep("reset"); }
    catch { setOtpError("Invalid or expired OTP. Please try again."); }
  };

  const onResetSubmit = async (data: ResetForm) => {
    try { await resetPassword(resetToken, data.newPassword); setStep("done"); } catch { /* error in store */ }
  };

  if (step === "done") return (
    <div className="space-y-6 text-center">
      <div className="mx-auto w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center text-primary"><CheckCircle2 className="h-7 w-7" /></div>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Password reset!</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">Your password has been reset successfully. You can now sign in with your new password.</p>
      </div>
      <Button className="w-full" onClick={() => router.push("/login")}>Back to Sign In</Button>
    </div>
  );

  return (
    <div className="space-y-6">
      {step === "send" && (
        <>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Forgot Password?</h2>
            <p className="text-sm text-muted-foreground">Enter your registered email or phone — we&apos;ll send a verification code.</p>
          </div>
          {error && <div className="p-3 text-xs font-medium text-destructive bg-destructive/10 rounded-lg border border-destructive/20">{error}</div>}
          <form onSubmit={sendForm.handleSubmit(onSendSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="identifier">Email or Phone Number</Label>
              <div className="relative"><Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input id="identifier" placeholder="name@example.com or +1 555 0201" className="pl-10" {...sendForm.register("identifier")} disabled={isLoading} /></div>
              {sendForm.formState.errors.identifier && <p className="text-xs text-destructive">{sendForm.formState.errors.identifier.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
              {isLoading ? "Sending..." : "Send Verification Code"}
            </Button>
          </form>
          <div className="text-center"><Link href="/login" className="inline-flex items-center text-sm font-semibold text-primary hover:underline gap-1.5"><ArrowLeft className="h-4 w-4" />Back to Sign In</Link></div>
        </>
      )}

      {step === "otp" && (
        <>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Enter verification code</h2>
            <p className="text-sm text-muted-foreground">We sent a 6-digit code for <span className="font-semibold text-foreground">{identifier}</span></p>
          </div>
          {(otpError || error) && <div className="p-3 text-xs font-medium text-destructive bg-destructive/10 rounded-lg border border-destructive/20">{otpError ?? error}</div>}
          <form onSubmit={onOtpSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-center block text-sm">Enter 6-digit code</Label>
              <div className="flex justify-between gap-2 max-w-xs mx-auto">
                {otpDigits.map((d, idx) => (
                  <Input key={idx} id={`fp-otp-${idx}`} type="text" inputMode="numeric" maxLength={1} value={d}
                    onChange={(e) => handleOtpChange(idx, e.target.value)} onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="w-11 h-12 text-center text-lg font-bold p-0 rounded-lg focus-visible:ring-2 focus-visible:ring-primary bg-background border-border" disabled={isLoading} />
                ))}
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading || otpDigits.some((d) => !d)}>
              {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{isLoading ? "Verifying..." : "Verify Code"}
            </Button>
          </form>
          <div className="flex items-center justify-between text-sm">
            <button type="button" onClick={() => { clearError(); setStep("send"); }} className="inline-flex items-center text-muted-foreground hover:text-foreground gap-1"><ArrowLeft className="h-4 w-4" /> Back</button>
            <button type="button" onClick={() => forgotPassword(identifier)} className="font-semibold text-primary hover:underline">Resend code</button>
          </div>
        </>
      )}

      {step === "reset" && (
        <>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Set new password</h2>
            <p className="text-sm text-muted-foreground">Choose a strong password for your account.</p>
          </div>
          {error && <div className="p-3 text-xs font-medium text-destructive bg-destructive/10 rounded-lg border border-destructive/20">{error}</div>}
          <form onSubmit={resetForm.handleSubmit(onResetSubmit)} className="space-y-4">
            {(["newPassword", "confirmPassword"] as const).map((field, i) => (
              <div key={field} className="space-y-1.5">
                <Label htmlFor={field}>{i === 0 ? "New Password" : "Confirm Password"}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id={field} placeholder="••••••••" type={(i === 0 ? showPassword : showConfirm) ? "text" : "password"} className="pl-10 pr-10" {...resetForm.register(field)} disabled={isLoading} />
                  <button type="button" onClick={() => i === 0 ? setShowPassword(!showPassword) : setShowConfirm(!showConfirm)} className="absolute right-3 top-3 text-muted-foreground hover:text-foreground" tabIndex={-1}>
                    {(i === 0 ? showPassword : showConfirm) ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {resetForm.formState.errors[field] && <p className="text-xs text-destructive">{resetForm.formState.errors[field]?.message}</p>}
              </div>
            ))}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{isLoading ? "Resetting..." : "Reset Password"}
            </Button>
          </form>
        </>
      )}
    </div>
  );
}
