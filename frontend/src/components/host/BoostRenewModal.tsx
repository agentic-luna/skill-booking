"use client";

import React, { useState } from "react";
import { X, Calendar, RefreshCw, Loader2, Sparkles } from "lucide-react";
import { useAlertStore } from "@/features/alerts/store/alertStore";
import { useAuthStore } from "@/features/auth/store/authStore";
import { getRazorpayPublicKey } from "@/features/payment/api/paymentApi";

interface BoostRenewModalProps {
  boostId: string;
  tier: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function BoostRenewModal({
  boostId,
  tier,
  isOpen,
  onClose,
  onSuccess,
}: BoostRenewModalProps) {
  const showAlert = useAlertStore((s) => s.showAlert);
  const { user } = useAuthStore();

  const [selectedDays, setSelectedDays] = useState<number>(7);
  const [customDays, setCustomDays] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const effectiveDays = customDays ? Math.max(1, Number(customDays)) : selectedDays;

  const handleRenewCheckout = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/v1/boosted-events/renew`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ boostId, additionalDays: effectiveDays }),
      }).then((r) => r.json());

      if (!response.success) {
        throw new Error(response.message || "Failed to initiate renewal.");
      }

      const { boostRequest, razorpayOrder, renewalFee } = response.data;

      // Fetch dynamic active Razorpay Key ID
      let activeKeyId = await getRazorpayPublicKey();
      const options = {
        key: activeKeyId,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "BookMyTraining",
        description: `Renew Promotion (+${effectiveDays} Days)`,
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
            showAlert("Campaign Extended! 🚀", `Your promotion has been extended by ${effectiveDays} days.`, "success");
            onSuccess();
            onClose();
          } catch (err: any) {
            showAlert("Verification Error", err.message || "Failed to confirm renewal payment.", "destructive");
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
      showAlert("Renewal Error", err.message || "Failed to process renewal.", "destructive");
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
              <RefreshCw className="h-5 w-5 text-[#a0f212]" />
            </div>
            <div>
              <h3 className="font-black text-base text-white">Extend / Renew Campaign</h3>
              <p className="text-xs text-emerald-100/50 font-medium">
                Active Tier: <span className="text-[#a0f212] uppercase font-bold">{tier}</span>
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

        {/* Duration Options */}
        <div className="space-y-4">
          <label className="text-xs text-emerald-100/60 font-black uppercase tracking-wider block">
            Select Extension Duration:
          </label>

          <div className="grid grid-cols-4 gap-2">
            {[3, 7, 15, 30].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => {
                  setSelectedDays(d);
                  setCustomDays("");
                }}
                className={`py-3 rounded-xl text-xs font-black transition-all border ${
                  selectedDays === d && !customDays
                    ? "bg-[#a0f212] text-[#0d1e17] border-[#a0f212] shadow-md"
                    : "bg-[#0d2218] text-emerald-100/70 border-emerald-950 hover:border-emerald-900"
                }`}
              >
                +{d} Days
              </button>
            ))}
          </div>

          <div className="space-y-1.5 pt-2">
            <label className="text-[10px] text-emerald-500 font-bold uppercase">Or enter custom days:</label>
            <input
              type="number"
              min={1}
              max={90}
              placeholder="e.g. 10 days"
              value={customDays}
              onChange={(e) => setCustomDays(e.target.value)}
              className="w-full bg-[#07130e] border border-emerald-900 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#a0f212] font-bold"
            />
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
            onClick={handleRenewCheckout}
            disabled={loading}
            className="bg-[#a0f212] hover:bg-[#aee665] text-[#0d1e17] text-xs font-black px-6 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Processing...
              </>
            ) : (
              `Extend by +${effectiveDays} Days`
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
