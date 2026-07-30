import React, { useEffect, useState } from "react";
import { Landmark, Brush, Save, Loader2 } from "lucide-react";
import { useAdminStore } from "@/features/admin/store/adminStore";
import { useAlertStore } from "@/features/alerts/store/alertStore";

export default function PlatformTab() {
  const showAlert = useAlertStore((s) => s.showAlert);
  const { platformSettings, fetchPlatformSettings, upsertPlatformSetting, loading } = useAdminStore();

  useEffect(() => { fetchPlatformSettings(); }, []);

  const findVal = (key: string, fallback: string) =>
    platformSettings.find((s) => s.key === key)?.value ?? fallback;

  const [commissionRate, setCommissionRate] = useState(15);
  const [refundWindow, setRefundWindow] = useState(48);
  const [minPayout, setMinPayout] = useState(50);
  const [platformName, setPlatformName] = useState("BookMySkill");
  const [slogan, setSlogan] = useState("Empowering experts, expanding learners.");
  const [boostPricing, setBoostPricing] = useState<Record<string, number | string>>({ "7": 500, "15": 900, "30": 1500 });

  useEffect(() => {
    if (platformSettings.length === 0) return;
    setCommissionRate(Number(findVal("commissionRate", "15")));
    setRefundWindow(Number(findVal("refundWindow", "48")));
    setMinPayout(Number(findVal("minPayout", "50")));
    setPlatformName(findVal("platformName", "BookMySkill"));
    setSlogan(findVal("slogan", "Empowering experts, expanding learners."));
    const pricingVal = findVal("BOOST_PRICING", "");
    if (pricingVal) {
      try {
        setBoostPricing(typeof pricingVal === 'string' ? JSON.parse(pricingVal) : pricingVal);
      } catch (e) {
        console.error("Failed to parse boost pricing", e);
      }
    }
  }, [platformSettings]);

  const handleSaveFinancials = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await Promise.all([
        upsertPlatformSetting({ key: "commissionRate", value: String(commissionRate) }),
        upsertPlatformSetting({ key: "refundWindow", value: String(refundWindow) }),
        upsertPlatformSetting({ key: "minPayout", value: String(minPayout) }),
      ]);
      showAlert("Financial Rules Saved", "Commission, refund, and payout settings applied globally.", "success");
    } catch { /* error in store */ }
  };

  const handleSaveBoostPricing = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const numericPricing = {
        "7": Number(boostPricing["7"]),
        "15": Number(boostPricing["15"]),
        "30": Number(boostPricing["30"]),
      };
      await upsertPlatformSetting({ key: "BOOST_PRICING", value: JSON.stringify(numericPricing) });
      showAlert("Boost Pricing Updated", "Event boost pricing updated successfully.", "success");
    } catch { /* error in store */ }
  };

  const handleSaveBranding = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await Promise.all([
        upsertPlatformSetting({ key: "platformName", value: platformName }),
        upsertPlatformSetting({ key: "slogan", value: slogan }),
      ]);
      showAlert("Branding Updated", "Platform display name and slogan updated.", "success");
    } catch { /* error in store */ }
  };

  return (
    <div className="space-y-6">

      {/* Financial Rules Card */}
      <div className="group relative overflow-hidden border border-black/5 dark:border-white/5 bg-card rounded-[32px] shadow-sm hover:shadow-md transition-all duration-300">
        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl pointer-events-none group-hover:bg-primary/10 transition-all duration-500" />
        <form onSubmit={handleSaveFinancials} className="relative z-10">
          {/* Card Header */}
          <div className="px-8 pt-8 pb-6 border-b border-black/5 dark:border-white/5">
            <div className="flex items-center gap-3">
              <div className="bg-[#0b0c01] p-2.5 rounded-2xl shadow-sm">
                <Landmark className="h-5 w-5 text-[#a0f212]" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-foreground">Commission & Refund Rules</h2>
                <p className="text-xs text-muted-foreground font-medium mt-0.5">Manage transaction payouts and learner ticket refund policies.</p>
              </div>
            </div>
          </div>

          {/* Card Body */}
          <div className="px-8 py-6 space-y-8">

            {/* Commission Rate Slider */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-sm font-bold text-foreground">Platform Commission Rate</label>
                <span className="bg-[#0b0c01] text-[#a0f212] font-black text-sm px-4 py-1.5 rounded-full shadow-sm">{commissionRate}%</span>
              </div>
              <input
                type="range" min={0.5} max={30} step={0.5} value={commissionRate}
                onChange={(e) => setCommissionRate(Number(e.target.value))}
                className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-[#a0f212]"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground font-semibold">
                <span>0.5% (Min)</span><span>Marketplace fee from host sales before payout</span><span>30% (Max)</span>
              </div>
            </div>

            {/* Refund Window Slider */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-sm font-bold text-foreground">Refund Cancellation Window</label>
                <span className="bg-[#0b0c01] text-[#a0f212] font-black text-sm px-4 py-1.5 rounded-full shadow-sm">{refundWindow}h</span>
              </div>
              <input
                type="range" min={12} max={72} step={12} value={refundWindow}
                onChange={(e) => setRefundWindow(Number(e.target.value))}
                className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-[#a0f212]"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground font-semibold">
                <span>12h</span><span>Time before class start for full cancel-refund</span><span>72h</span>
              </div>
            </div>

            {/* Min Payout Input */}
            <div className="space-y-2 max-w-xs">
              <label className="text-sm font-bold text-foreground">Min. Withdrawable Balance (INR)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm">₹</span>
                <input
                  type="number"
                  value={minPayout}
                  onChange={(e) => setMinPayout(Number(e.target.value))}
                  className="w-full pl-8 pr-4 h-12 rounded-2xl border border-black/10 dark:border-white/10 bg-muted/30 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#a0f212]/40"
                />
              </div>
              <p className="text-[10px] text-muted-foreground font-medium">Minimum account balance threshold for payout transfers.</p>
            </div>
          </div>

          {/* Card Footer */}
          <div className="px-8 py-5 border-t border-black/5 dark:border-white/5 flex justify-end bg-muted/20 rounded-b-[32px]">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-[#0b0c01] text-white hover:bg-[#1a1c02] px-8 py-3 rounded-full font-bold text-sm shadow-xl transition-all disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Financial Rules
            </button>
          </div>
        </form>
      </div>

      
    </div>
  );
}
