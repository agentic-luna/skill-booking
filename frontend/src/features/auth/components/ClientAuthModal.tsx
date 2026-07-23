"use client";

import React from "react";
import { 
  Lock, Phone, Mail, User, Eye, EyeOff, Loader2, ArrowRight, ArrowLeft, CheckCircle2, ShieldCheck, Sparkles, AlertCircle, AlertTriangle 
} from "lucide-react";
import { useAuthStore } from "@/features/auth/store/authStore";
import { useClientAuthModalStore } from "@/features/auth/store/clientAuthModalStore";
import { useClientEmailModalStore } from "@/features/auth/store/clientEmailModalStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, DialogContent, DialogTitle, DialogDescription 
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import PhoneInputWithCountry from "@/components/common/PhoneInputWithCountry";
import PasswordStrengthMeter from "@/components/common/PasswordStrengthMeter";
import { clientSignupZodSchema } from "@/lib/validation/authValidation";

interface ClientAuthModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
  defaultTab?: "login" | "signup";
}

export default function ClientAuthModal({
  open: propOpen,
  onOpenChange: propOnOpenChange,
  onSuccess: propOnSuccess,
  defaultTab,
}: ClientAuthModalProps) {
  const { login, clientSendOtp, clientSignup, isLoading, error, clearError } = useAuthStore();
  
  // Connect to Zustand store
  const store = useClientAuthModalStore();

  const isControlled = propOpen !== undefined;
  const isOpen = isControlled ? propOpen : store.isOpen;
  const activeTab = store.activeTab;
  const signupStep = store.signupStep;

  const handleOpenChange = (val: boolean) => {
    if (propOnOpenChange) {
      propOnOpenChange(val);
    }
    if (!val) {
      store.closeModal();
    }
  };

  const handleTabChange = (val: string) => {
    store.setActiveTab(val as "login" | "signup");
    clearError();
  };

  // Submit Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    store.setLocalMessage(null);
    try {
      await login(store.loginIdentifier, store.loginPassword);
      handleOpenChange(false);
      const cb = propOnSuccess || store.onSuccessCallback;
      store.resetForm();
      cb?.();
    } catch {
      // Error in store
    }
  };

  // Step 1 Signup: Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    store.setLocalMessage(null);
    clearError();

    const valResult = clientSignupZodSchema.safeParse({
      firstName: store.firstName,
      lastName: store.lastName,
      phone: store.phone,
      password: store.signupPassword,
    });

    if (!valResult.success) {
      const errMsg = valResult.error.errors[0]?.message || "Invalid input details.";
      store.setLocalMessage(errMsg);
      return;
    }

    try {
      const res = await clientSendOtp(store.phone);
      store.setLocalMessage(res.message || "OTP code sent to your WhatsApp number.");
      store.setSignupStep(2);
    } catch {
      // Error in store
    }
  };

  // Step 2 Signup: Complete Signup with OTP
  const handleCompleteSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    store.setLocalMessage(null);
    if (!store.otp || store.otp.trim().length === 0) {
      store.setLocalMessage("Please enter the 6-digit OTP code.");
      return;
    }

    try {
      await clientSignup({
        firstName: store.firstName,
        lastName: store.lastName,
        phone: store.phone,
        password: store.signupPassword,
        otp: store.otp.trim(),
      });
      handleOpenChange(false);
      const cb = propOnSuccess || store.onSuccessCallback;
      store.resetForm();
      cb?.();
      // Auto open email magic link verification popup
      useClientEmailModalStore.getState().openModal();
    } catch {
      // Error in store
    }
  };

  const handleResendOtp = async () => {
    store.setLocalMessage(null);
    try {
      const res = await clientSendOtp(store.phone);
      store.setLocalMessage(res.message || "A new OTP code has been sent.");
    } catch {
      // Error in store
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-3xl border border-border/40 shadow-2xl bg-background">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#0b0c01] to-[#1a2e05] p-6 text-white relative">
          <div className="flex items-center space-x-2 text-[#a0f212] mb-1 text-xs font-extrabold tracking-wider uppercase">
            <Sparkles className="h-4 w-4" />
            <span>Learner Access</span>
          </div>
          <DialogTitle className="text-2xl font-black tracking-tight text-white">
            {activeTab === "login" ? "Welcome Back" : "Create Client Account"}
          </DialogTitle>
          <DialogDescription className="text-white/70 text-xs mt-1">
            {activeTab === "login" 
              ? "Sign in with your phone or email to book workshops and access tickets." 
              : "Sign up with your WhatsApp number to start booking live skill training."}
          </DialogDescription>
        </div>

        {/* Form Container */}
        <div className="p-6">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid grid-cols-2 w-full mb-6 bg-muted/60 p-1 rounded-xl">
              <TabsTrigger value="login" className="rounded-lg text-xs font-bold py-2">
                Sign In
              </TabsTrigger>
              <TabsTrigger value="signup" className="rounded-lg text-xs font-bold py-2">
                Sign Up
              </TabsTrigger>
            </TabsList>

            {/* ERROR DISPLAY (RED) */}
            {error && (
              <div className="p-3 mb-4 text-xs font-semibold rounded-xl border bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400 flex items-center gap-2 animate-pulse">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            {/* WARNING / NOTICE DISPLAY (YELLOW / AMBER) */}
            {!error && store.localMessage && (
              <div className="p-3 mb-4 text-xs font-semibold rounded-xl border bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
                <span>{store.localMessage}</span>
              </div>
            )}

            {/* ── SIGN IN TAB ── */}
            <TabsContent value="login" className="mt-0">
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="modal-identifier" className="text-xs font-bold">Email or WhatsApp Number</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="modal-identifier"
                      placeholder="name@example.com or +919947811507"
                      type="text"
                      className="pl-10 h-10 text-xs rounded-xl"
                      value={store.loginIdentifier}
                      onChange={(e) => store.setLoginIdentifier(e.target.value)}
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="modal-password" className="text-xs font-bold">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="modal-password"
                      placeholder="••••••••"
                      type={store.showLoginPassword ? "text" : "password"}
                      className="pl-10 pr-10 h-10 text-xs rounded-xl"
                      value={store.loginPassword}
                      onChange={(e) => store.setLoginPassword(e.target.value)}
                      disabled={isLoading}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => store.setShowLoginPassword(!store.showLoginPassword)}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                      tabIndex={-1}
                    >
                      {store.showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-11 text-xs font-extrabold rounded-xl bg-gradient-to-r from-[#1b2b0a] to-[#2a420f] border border-[#a0f212]/30 text-[#a0f212] hover:from-[#a0f212] hover:to-[#8ce20b] hover:text-[#0b0c01] transition-all shadow-md mt-2" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center"><Loader2 className="h-4 w-4 animate-spin mr-2" /> Signing in...</span>
                  ) : (
                    <span className="flex items-center justify-center">Sign In <ArrowRight className="h-4 w-4 ml-2" /></span>
                  )}
                </Button>
              </form>
            </TabsContent>

            {/* ── SIGN UP TAB ── */}
            <TabsContent value="signup" className="mt-0">
              {signupStep === 1 ? (
                <form onSubmit={handleSendOtp} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="modal-fname" className="text-xs font-bold">First Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="modal-fname"
                          placeholder="John"
                          className="pl-10 h-10 text-xs rounded-xl"
                          value={store.firstName}
                          onChange={(e) => store.setFirstName(e.target.value)}
                          disabled={isLoading}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="modal-lname" className="text-xs font-bold">Last Name</Label>
                      <Input
                        id="modal-lname"
                        placeholder="Doe"
                        className="h-10 text-xs rounded-xl"
                        value={store.lastName}
                        onChange={(e) => store.setLastName(e.target.value)}
                        disabled={isLoading}
                        required
                      />
                    </div>
                  </div>

                  <PhoneInputWithCountry
                    id="modal-phone"
                    value={store.phone}
                    onChange={(val) => store.setPhone(val)}
                    disabled={isLoading}
                    label="WhatsApp Number (with Country Code)"
                    isWhatsApp={true}
                  />

                  <div className="space-y-1">
                    <Label htmlFor="modal-signup-password" className="text-xs font-bold">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="modal-signup-password"
                        placeholder="••••••••"
                        type={store.showSignupPassword ? "text" : "password"}
                        className="pl-10 pr-10 h-10 text-xs rounded-xl"
                        value={store.signupPassword}
                        onChange={(e) => store.setSignupPassword(e.target.value)}
                        disabled={isLoading}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => store.setShowSignupPassword(!store.showSignupPassword)}
                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                        tabIndex={-1}
                      >
                        {store.showSignupPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <PasswordStrengthMeter password={store.signupPassword} />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-11 text-xs font-extrabold rounded-xl bg-gradient-to-r from-[#1b2b0a] to-[#2a420f] border border-[#a0f212]/30 text-[#a0f212] hover:from-[#a0f212] hover:to-[#8ce20b] hover:text-[#0b0c01] transition-all shadow-md mt-3" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center"><Loader2 className="h-4 w-4 animate-spin mr-2" /> Sending OTP...</span>
                    ) : (
                      <span className="flex items-center justify-center">Send Verification Code <ArrowRight className="h-4 w-4 ml-2" /></span>
                    )}
                  </Button>
                </form>
              ) : (
                /* Step 2: Enter OTP & Complete Signup */
                <form onSubmit={handleCompleteSignup} className="space-y-4">
                  <button 
                    type="button" 
                    onClick={() => store.setSignupStep(1)} 
                    className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground mb-1"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" /> Back to details
                  </button>

                  <div className="p-3 bg-muted/40 rounded-xl border border-border/40 space-y-1 text-xs">
                    <span className="font-extrabold text-foreground flex items-center">
                      <ShieldCheck className="h-4 w-4 text-[#a0f212] mr-1.5" /> Verify WhatsApp Number
                    </span>
                    <p className="text-muted-foreground text-[11px]">
                      Enter the 6-digit verification code sent to <strong className="text-foreground">{store.phone}</strong>.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="modal-otp" className="text-xs font-bold">6-Digit OTP Code</Label>
                    <Input
                      id="modal-otp"
                      placeholder="123456"
                      type="text"
                      maxLength={6}
                      className="h-12 text-center text-lg font-black tracking-widest rounded-xl"
                      value={store.otp}
                      onChange={(e) => store.setOtp(e.target.value)}
                      disabled={isLoading}
                      required
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Didn&apos;t receive code?</span>
                    <button 
                      type="button" 
                      onClick={handleResendOtp} 
                      className="font-bold text-[#a0f212] hover:underline"
                      disabled={isLoading}
                    >
                      Resend OTP
                    </button>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-11 text-xs font-extrabold rounded-xl bg-gradient-to-r from-[#1b2b0a] to-[#2a420f] border border-[#a0f212]/30 text-[#a0f212] hover:from-[#a0f212] hover:to-[#8ce20b] hover:text-[#0b0c01] transition-all shadow-md" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center"><Loader2 className="h-4 w-4 animate-spin mr-2" /> Completing Signup...</span>
                    ) : (
                      <span className="flex items-center justify-center"><CheckCircle2 className="h-4 w-4 mr-2" /> Verify & Complete Registration</span>
                    )}
                  </Button>
                </form>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
