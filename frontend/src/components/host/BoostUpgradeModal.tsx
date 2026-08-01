"use client";

import React, { useState } from "react";
import { X, Rocket, Zap, Check, ShieldCheck, Loader2 } from "lucide-react";
import { useAlertStore } from "@/features/alerts/store/alertStore";
import { useAuthStore } from "@/features/auth/store/authStore";
import { getRazorpayPublicKey } from "@/features/payment/api/paymentApi";

interface BoostUpgradeModalProps {
  boostId: string;
  currentTier: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function BoostUpgradeModal({
  boostId,
  currentTier,
  isOpen,
  onClose,
  onSuccess,
}: BoostUpgradeModalProps) {
  const showAlert = useAlertStore((s) => s.showAlert);
  const { user } = useAuthStore();

  const normalizedCurrent = (currentTier || "BASIC").toUpperCase();
  const [selectedTarget, setSelectedTarget] = useState<"STANDARD" | "PRO">(
    normalizedCurrent === "BASIC" ? "STANDARD" : "PRO"
  );
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleUpgradeCheckout = async () => {
    setLoading(true);
    try {
      // Call upgrade API endpoint
      const response = await fetch(`/api/v1/boosted-events/upgrade`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ boostId, newTier: selectedTarget }),
      }).then((r) => r.json());

      if (!response.success) {
        throw new Error(response.message || "Failed to initiate upgrade.");
      }

      const { boostRequest, razorpayOrder, upgradeFee } = response.data;

      // Fetch dynamic active Razorpay Key ID
      let activeKeyId = await getRazorpayPublicKey();
      const options = {
        key: activeKeyId,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "BookMyTraining",
        description: `Upgrade Campaign to ${selectedTarget}`,
        order_id: razorpayOrder.id,
        handler: async function (res: any) {
          try {
            await fetch(`/api/v1/boosted-events/verify-payment`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                boostId: boostRequest.id,
                razorpayPaymentId: res.razorpay_payment_id,
                razorpayOrderId: res.razorpay_order_id,
                razorpaySignature: res.razorpay_signature,
              }),
            });
            showAlert("Tier Upgraded! 🚀", `Your promotion is now upgraded to ${selectedTarget}.`, "success");
            onSuccess();
            onClose();
          } catch (err: any) {
            showAlert("Verification Error", err.message || "Failed to confirm upgrade payment.", "destructive");
          }
        },
        prefill: {
          name: `${user?.firstName || ""} ${user?.lastName || ""}`.trim(),
          email: user?.email || "",
          contact: user?.phone || "",
        },
        theme: {
          color: "#a0f212",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      showAlert("Upgrade Error", err.message || "Failed to process upgrade.", "destructive");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#07130e] border border-emerald-900/60 rounded-[36px] max-w-md w-full p-6 sm:p-8 shadow-2xl text-white relative overflow-hidden space-y-6">
        
        {/* Glow */}
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-[#a0f212]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-emerald-950 pb-4">
          <div className="flex items-center gap-3">
            <div className="bg-[#a0f212]/10 p-2.5 rounded-2xl border border-[#a0f212]/20">
              <Rocket className="h-5 w-5 text-[#a0f212]" />
            </div>
            <div>
              <h3 className="font-black text-base text-white">Upgrade Promotion Tier</h3>
              <p className="text-xs text-emerald-100/50 font-medium">
                Current Tier: <span className="text-[#a0f212] uppercase font-bold">{normalizedCurrent}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-emerald-100/70 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Options */}
        <div className="space-y-4">
          <p className="text-xs text-emerald-100/60 font-medium">
            Select a higher promotion plan. Pay only the prorated difference for remaining campaign days:
          </p>

          {normalizedCurrent !== "STANDARD" && normalizedCurrent !== "PRO" && (
            <div
              onClick={() => setSelectedTarget("STANDARD")}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                selectedTarget === "STANDARD"
                  ? "bg-[#0d2218] border-[#a0f212] shadow-lg"
                  : "bg-[#07130e] border-emerald-950 hover:border-emerald-900"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-[#a0f212]" />
                  <span className="text-xs font-black uppercase text-white">Pro Boost (STANDARD)</span>
                </div>
                {selectedTarget === "STANDARD" && <Check className="h-4 w-4 text-[#a0f212]" />}
              </div>
              <p className="text-[10px] text-emerald-100/50 font-semibold mt-1">
                Includes Homepage Carousel, Trending Section, Top Search Listings, and Pro Host Badge.
              </p>
            </div>
          )}

          <div
            onClick={() => setSelectedTarget("PRO")}
            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
              selectedTarget === "PRO"
                ? "bg-[#0d2218] border-[#a0f212] shadow-lg"
                : "bg-[#07130e] border-emerald-950 hover:border-emerald-900"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Rocket className="h-4 w-4 text-purple-400" />
                <span className="text-xs font-black uppercase text-white">Ultra Pro Boost (PRO)</span>
              </div>
              {selectedTarget === "PRO" && <Check className="h-4 w-4 text-[#a0f212]" />}
            </div>
            <p className="text-[10px] text-emerald-100/50 font-semibold mt-1">
              Includes Homepage Hero Banner, Highest Search Priority, Email/Push Campaigns, and Premium Support.
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-emerald-950 text-xs font-bold text-emerald-100/70 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleUpgradeCheckout}
            disabled={loading}
            className="bg-[#a0f212] hover:bg-[#aee665] text-[#0d1e17] text-xs font-black px-6 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Upgrading...
              </>
            ) : (
              `Upgrade to ${selectedTarget}`
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
