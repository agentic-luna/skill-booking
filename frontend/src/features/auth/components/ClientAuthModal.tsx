"use client";

import React, { useState } from "react";
import { 
  Lock, Phone, Mail, User, Eye, EyeOff, Loader2, ArrowRight, ArrowLeft, CheckCircle2, ShieldCheck, Sparkles 
} from "lucide-react";
import { useAuthStore } from "@/features/auth/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription 
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface ClientAuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  defaultTab?: "login" | "signup";
}

export default function ClientAuthModal({
  open,
  onOpenChange,
  onSuccess,
  defaultTab = "login",
}: ClientAuthModalProps) {
  const { login, clientSendOtp, clientSignup, isLoading, error, clearError } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"login" | "signup">(defaultTab);

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Signup form state
  const [signupStep, setSignupStep] = useState<1 | 2>(1);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [localMessage, setLocalMessage] = useState<string | null>(null);

  const resetForm = () => {
    setLoginIdentifier("");
    setLoginPassword("");
    setFirstName("");
    setLastName("");
    setPhone("");
    setSignupPassword("");
    setOtp("");
    setSignupStep(1);
    setLocalMessage(null);
    clearError();
  };

  const handleTabChange = (val: string) => {
    setActiveTab(val as "login" | "signup");
    resetForm();
  };

  // Submit Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalMessage(null);
    try {
      await login(loginIdentifier, loginPassword);
      onOpenChange(false);
      resetForm();
      onSuccess?.();
    } catch (err: any) {
      // Error handled by store
    }
  };

  // Step 1 Signup: Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalMessage(null);
    if (!firstName || !lastName || !phone || !signupPassword) {
      setLocalMessage("Please fill in all required fields.");
      return;
    }
    if (signupPassword.length < 6) {
      setLocalMessage("Password must be at least 6 characters long.");
      return;
    }

    try {
      const res = await clientSendOtp(phone);
      setLocalMessage(res.message || "OTP code sent to your WhatsApp number.");
      setSignupStep(2);
    } catch (err: any) {
      // Error in store
    }
  };

  // Step 2 Signup: Complete Signup with OTP
  const handleCompleteSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalMessage(null);
    if (!otp || otp.trim().length === 0) {
      setLocalMessage("Please enter the 6-digit OTP code.");
      return;
    }

    try {
      await clientSignup({
        firstName,
        lastName,
        phone,
        password: signupPassword,
        otp: otp.trim(),
      });
      onOpenChange(false);
      resetForm();
      onSuccess?.();
    } catch (err: any) {
      // Error in store
    }
  };

  const handleResendOtp = async () => {
    setLocalMessage(null);
    try {
      const res = await clientSendOtp(phone);
      setLocalMessage(res.message || "A new OTP code has been sent.");
    } catch (err: any) {
      // Error in store
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => { onOpenChange(val); if (!val) resetForm(); }}>
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

            {/* ERROR / LOCAL MESSAGE DISPLAY */}
            {(error || localMessage) && (
              <div className={`p-3 mb-4 text-xs font-semibold rounded-xl border ${
                error 
                  ? "bg-destructive/10 border-destructive/20 text-destructive animate-pulse" 
                  : "bg-[#a0f212]/10 border-[#a0f212]/30 text-[#0b0c01] dark:text-[#a0f212]"
              }`}>
                {error || localMessage}
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
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
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
                      type={showLoginPassword ? "text" : "password"}
                      className="pl-10 pr-10 h-10 text-xs rounded-xl"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      disabled={isLoading}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                      tabIndex={-1}
                    >
                      {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
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
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        disabled={isLoading}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="modal-phone" className="text-xs font-bold">WhatsApp / Mobile Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="modal-phone"
                        placeholder="+91 9876543210"
                        type="tel"
                        className="pl-10 h-10 text-xs rounded-xl"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        disabled={isLoading}
                        required
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground">OTP verification will be sent to this WhatsApp number.</p>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="modal-signup-password" className="text-xs font-bold">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="modal-signup-password"
                        placeholder="••••••••"
                        type={showSignupPassword ? "text" : "password"}
                        className="pl-10 pr-10 h-10 text-xs rounded-xl"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        disabled={isLoading}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignupPassword(!showSignupPassword)}
                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                        tabIndex={-1}
                      >
                        {showSignupPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
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
                    onClick={() => setSignupStep(1)} 
                    className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground mb-1"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" /> Back to details
                  </button>

                  <div className="p-3 bg-muted/40 rounded-xl border border-border/40 space-y-1 text-xs">
                    <span className="font-extrabold text-foreground flex items-center">
                      <ShieldCheck className="h-4 w-4 text-[#a0f212] mr-1.5" /> Verify WhatsApp Number
                    </span>
                    <p className="text-muted-foreground text-[11px]">
                      Enter the 6-digit verification code sent to <strong className="text-foreground">{phone}</strong>.
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
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      disabled={isLoading}
                      required
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Didn&apos;t receive code?</span>
                    <button 
                      type="button" 
                      onClick={handleResendOtp} 
                      className="font-bold text-primary hover:underline"
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
