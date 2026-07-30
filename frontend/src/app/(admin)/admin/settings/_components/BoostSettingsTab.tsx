import React, { useEffect, useState } from "react";
import { Save, Loader2, Plus, Trash2, Rocket } from "lucide-react";
import { useAdminStore } from "@/features/admin/store/adminStore";
import { useAlertStore } from "@/features/alerts/store/alertStore";
import { Button } from "@/components/ui/button";

export default function BoostSettingsTab() {
  const showAlert = useAlertStore((s) => s.showAlert);
  const { platformSettings, fetchPlatformSettings, upsertPlatformSetting, loading } = useAdminStore();

  const [boostPricing, setBoostPricing] = useState<any[]>([]);

  useEffect(() => {
    fetchPlatformSettings();
  }, []);

  useEffect(() => {
    if (platformSettings.length === 0) return;
    const pricingVal = platformSettings.find((s) => s.key === "BOOST_PRICING")?.value;
    if (pricingVal) {
      try {
        const parsed = typeof pricingVal === 'string' ? JSON.parse(pricingVal) : pricingVal;
        if (Array.isArray(parsed)) {
          setBoostPricing(parsed);
        } else {
          // Fallback if old format
          setBoostPricing([
            { id: "def-basic-7", tier: "BASIC", days: 7, price: 400 },
            { id: "def-basic-15", tier: "BASIC", days: 15, price: 800 },
            { id: "def-basic-30", tier: "BASIC", days: 30, price: 2000 },
          ]);
        }
      } catch (e) {
        console.error("Failed to parse boost pricing", e);
      }
    } else {
      setBoostPricing([
        { id: "def-basic-7", tier: "BASIC", days: 7, price: 400 },
        { id: "def-basic-15", tier: "BASIC", days: 15, price: 800 },
        { id: "def-basic-30", tier: "BASIC", days: 30, price: 2000 },
        { id: "def-standard-7", tier: "STANDARD", days: 7, price: 600 },
        { id: "def-standard-15", tier: "STANDARD", days: 15, price: 1200 },
        { id: "def-standard-30", tier: "STANDARD", days: 30, price: 3000 },
        { id: "def-pro-7", tier: "PRO", days: 7, price: 1000 },
        { id: "def-pro-15", tier: "PRO", days: 15, price: 2000 },
        { id: "def-pro-30", tier: "PRO", days: 30, price: 5000 },
      ]);
    }
  }, [platformSettings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await upsertPlatformSetting({ key: "BOOST_PRICING", value: JSON.stringify(boostPricing) });
      showAlert("Boost Pricing Updated", "Event boost pricing updated successfully.", "success");
    } catch {
      showAlert("Error", "Failed to update boost pricing.", "destructive");
    }
  };

  const addPlan = () => {
    setBoostPricing([
      ...boostPricing,
      { id: Date.now().toString(), tier: "BASIC", days: 7, price: 500 }
    ]);
  };

  const removePlan = (id: string) => {
    setBoostPricing(boostPricing.filter(p => p.id !== id));
  };

  const updatePlan = (id: string, field: string, value: any) => {
    setBoostPricing(boostPricing.map(p => {
      if (p.id === id) {
        let parsedValue = value;
        if (field === 'days' || field === 'price') {
          parsedValue = value === "" ? "" : Number(value);
        }
        return { ...p, [field]: parsedValue };
      }
      return p;
    }));
  };

  return (
    <div className="space-y-6">
      <div className="group relative overflow-hidden border border-black/5 dark:border-white/5 bg-card rounded-[32px] shadow-sm hover:shadow-md transition-all duration-300">
        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-[#a0f212]/5 rounded-full blur-3xl pointer-events-none group-hover:bg-[#a0f212]/10 transition-all duration-500" />
        <form onSubmit={handleSave} className="relative z-10">
          <div className="px-8 pt-8 pb-6 border-b border-black/5 dark:border-white/5">
            <div className="flex items-center gap-3">
              <div className="bg-[#0b0c01] p-2.5 rounded-2xl shadow-sm">
                <Rocket className="h-5 w-5 text-[#a0f212]" />
              </div>
              <div className="flex-1 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-extrabold text-foreground">Boost Tier Pricing (INR)</h2>
                  <p className="text-xs text-muted-foreground font-medium mt-0.5">Configure the days and prices for Basic, Standard, and Pro boost tiers.</p>
                </div>
                <Button type="button" onClick={addPlan} variant="outline" className="border-[#a0f212] text-[#a0f212] hover:bg-[#a0f212] hover:text-[#0b0c01] h-9">
                  <Plus className="w-4 h-4 mr-2" /> Add Plan
                </Button>
              </div>
            </div>
          </div>

          <div className="px-8 py-6 space-y-4 max-h-[60vh] overflow-y-auto">
            {boostPricing.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                No boost plans configured.
              </div>
            ) : (
              boostPricing.map((plan) => (
                <div key={plan.id} className="flex flex-col sm:flex-row items-end sm:items-center gap-4 bg-muted/20 p-4 rounded-2xl border border-border/50">
                  <div className="w-full sm:w-1/3 space-y-2">
                    <label className="text-xs font-bold text-foreground">Tier</label>
                    <select
                      value={plan.tier}
                      onChange={(e) => updatePlan(plan.id, 'tier', e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-black/50 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#a0f212]/40"
                    >
                      <option value="BASIC">BASIC</option>
                      <option value="STANDARD">STANDARD</option>
                      <option value="PRO">PRO</option>
                    </select>
                  </div>
                  <div className="w-full sm:w-1/3 space-y-2">
                    <label className="text-xs font-bold text-foreground">Duration (Days)</label>
                    <input
                      type="number"
                      min={1}
                      value={plan.days}
                      onChange={(e) => updatePlan(plan.id, 'days', e.target.value)}
                      className="w-full px-4 h-10 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-black/50 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#a0f212]/40"
                    />
                  </div>
                  <div className="w-full sm:w-1/3 space-y-2">
                    <label className="text-xs font-bold text-foreground">Price (INR)</label>
                    <input
                      type="number"
                      min={0}
                      value={plan.price}
                      onChange={(e) => updatePlan(plan.id, 'price', e.target.value)}
                      className="w-full px-4 h-10 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-black/50 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#a0f212]/40"
                    />
                  </div>
                  <Button type="button" variant="ghost" onClick={() => removePlan(plan.id)} className="h-10 w-10 p-0 text-red-500 hover:text-red-600 hover:bg-red-50">
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </div>
              ))
            )}
          </div>

          <div className="px-8 py-5 border-t border-black/5 dark:border-white/5 flex justify-end bg-muted/20 rounded-b-[32px]">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-[#0b0c01] text-white hover:bg-[#1a1c02] px-8 py-3 rounded-full font-bold text-sm shadow-xl transition-all disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Boost Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
