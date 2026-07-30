"use client";

import React from "react";
import { Mail, Loader2, ArrowRight, CheckCircle2, Sparkles, AlertCircle, AlertTriangle, Send } from "lucide-react";
import { useAuthStore } from "@/features/auth/store/authStore";
import { useClientEmailModalStore } from "@/features/auth/store/clientEmailModalStore";
import { normalizeEmail, isValidEmail } from "@/lib/validation/authValidation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, DialogContent, DialogTitle, DialogDescription 
} from "@/components/ui/dialog";

export default function ClientEmailModal() {
  const { sendEmailMagicLink, isLoading, error, clearError } = useAuthStore();
  const store = useClientEmailModalStore();

  const handleOpenChange = (val: boolean) => {
    if (!val) {
      store.closeModal();
      clearError();
    }
  };

  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    store.setLocalMessage(null);
    clearError();

    const cleanEmail = normalizeEmail(store.email);
    if (!cleanEmail || !isValidEmail(cleanEmail)) {
      store.setLocalMessage("Please enter a valid email address (e.g. name@example.com).");
      return;
    }

    try {
      const res = await sendEmailMagicLink(cleanEmail);
      store.setIsSent(true);
      store.setMagicLink(res.magicLink || null);
      store.setLocalMessage(res.message || "Magic verification link sent to your inbox!");
    } catch {
      // Error in store
    }
  };

  const handleResend = async () => {
    store.setLocalMessage(null);
    clearError();
    try {
      const res = await sendEmailMagicLink(store.email.trim());
      store.setMagicLink(res.magicLink || null);
      store.setLocalMessage(res.message || "Magic verification link re-sent!");
    } catch {
      // Error in store
    }
  };

  return (
    <Dialog open={store.isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-3xl border border-border/40 shadow-2xl bg-background">
        
        {/* Modal Header */}
        <div className="p-6 pb-2">
          <DialogTitle className="text-xl font-bold text-gray-900">
            {store.isSent ? "Check Your Inbox" : "Verify Email Address"}
          </DialogTitle>
          <DialogDescription className="text-sm mt-1">
            {store.isSent 
              ? "We have dispatched a magic verification link to your email address." 
              : "Link your email address to receive workshop tickets, calendar invites, and instant booking updates."}
          </DialogDescription>
        </div>

        {/* Modal Body */}
        <div className="p-6">

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

          {!store.isSent ? (
            /* Step 1: Input Email */
            <form onSubmit={handleSendMagicLink} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="client-email-input" className="text-xs font-bold">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="client-email-input"
                    type="email"
                    placeholder="name@example.com"
                    className="pl-10 h-10 text-xs rounded-xl"
                    value={store.email}
                    onChange={(e) => store.setEmail(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>
                <p className="text-[10px] text-muted-foreground">
                  We will send a one-click magic verification link to this email address.
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full h-10 text-xs font-bold rounded-xl mt-2" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center"><Loader2 className="h-4 w-4 animate-spin mr-2" /> Dispatching Magic Link...</span>
                ) : (
                  <span className="flex items-center justify-center"><Send className="h-4 w-4 mr-2" /> Send Magic Link <ArrowRight className="h-4 w-4 ml-2" /></span>
                )}
              </Button>
            </form>
          ) : (
            /* Step 2: Sent Confirmation */
            <div className="space-y-4 text-center py-2">
              <div className="mx-auto w-14 h-14 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center">
                <Mail className="h-7 w-7 text-primary" />
              </div>

              <div className="space-y-1">
                <h4 className="text-sm font-black text-foreground">Magic Link Sent!</h4>
                <p className="text-xs text-muted-foreground px-2">
                  Click the magic link sent to <strong className="text-foreground">{store.email}</strong> to complete verification.
                </p>
              </div>

              {/* DEV TEST MAGIC LINK BOX */}
              {store.magicLink && (
                <div className="p-3 bg-primary/10 border border-primary/20 rounded-2xl text-left space-y-1.5 mt-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-foreground">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-primary" /> 
                      <span>Dev Test Magic Link</span>
                    </span>
                    <span className="text-[9px] uppercase tracking-wider bg-primary/20 text-primary px-1.5 py-0.5 rounded font-bold">Development</span>
                  </div>
                  <a 
                    href={store.magicLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    onClick={() => store.closeModal()}
                    className="text-xs font-mono font-bold text-primary underline break-all block hover:text-primary/80"
                  >
                    {store.magicLink}
                  </a>
                </div>
              )}

              <div className="pt-2 flex flex-col gap-2">
                <Button 
                  variant="outline" 
                  onClick={handleResend}
                  disabled={isLoading}
                  className="w-full h-10 text-xs font-bold rounded-xl"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Resend Magic Link
                </Button>

                <button 
                  type="button" 
                  onClick={() => store.setIsSent(false)} 
                  className="text-xs font-semibold text-muted-foreground hover:text-foreground pt-1"
                >
                  Change Email Address
                </button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
